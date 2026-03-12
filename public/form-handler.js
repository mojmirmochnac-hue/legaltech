(function attachFormHandlers() {
  const forms = document.querySelectorAll("form");

  forms.forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const formData = new FormData(form);
      const fields = {};

      formData.forEach((value, key) => {
        fields[key] = typeof value === "string" ? value : value.name;
      });

      const submitButton = form.querySelector('[type="submit"]');
      const originalButtonText = submitButton ? submitButton.textContent : null;

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Odosielam...";
      }

      try {
        const response = await fetch("/api/forms", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            formName: form.getAttribute("name") || form.id || "website-form",
            fields
          })
        });

        if (!response.ok) {
          throw new Error("Form submit failed");
        }

        form.reset();
        form.dispatchEvent(new CustomEvent("form:success", { bubbles: true }));
      } catch (error) {
        form.dispatchEvent(
          new CustomEvent("form:error", {
            detail: { error },
            bubbles: true
          })
        );
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = originalButtonText || "Odoslať";
        }
      }
    });
  });
})();
