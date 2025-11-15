document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("request-form");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name-input").value.trim();
    const phone = document.getElementById("phone-input").value.trim();
    const email = document.getElementById("email-input").value.trim();
    const comment = document.getElementById("comment-textarea").value.trim();

    const payload = {
      name,
      phoneNumber: phone,
      email,
      comment
    };

    try {
      await fetch("https://api.blissdev.ru/api/landing-applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      form.reset();

    } catch (error) {
    }
  });
});
