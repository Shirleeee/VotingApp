export const init = () => {
  if (
    "querySelector" in document &&
    "head" in document &&
    "classList" in document.head &&
    "addEventListener" in window
  ) {
    document.addEventListener("DOMContentLoaded", setup);
  }
};

const setup = () => {
  const formsfilmtitles = document.querySelectorAll(".filmtitle-form");
  const formsregie = document.querySelectorAll(".regie-form");
  const formsimg = document.querySelectorAll(".img-form");

  formsfilmtitles.forEach((form, index) => {
    form.addEventListener("submit", async function (event) {
      event.preventDefault(); // Verhindert das Neuladen der Seite

      const formData = new FormData(form);

      try {
        const response = await fetch(`/blockDetails/${index + 1}`, {
          method: "POST",
          body: formData,
        });

        const textResponse = await response.text();

        const responseData = JSON.parse(textResponse);

        if (response.ok) {
          console.log("🚀 ~ response okay:", response);

          if (formData.get("filmtitle") !== "") {
            const title = document.querySelector(
              `.sec${index + 1} .section-wrapper .card__container .card__title`
            );
            title.innerHTML = formData.get("filmtitle");
            const details = document.querySelector(
              `#filmTitleDetails${index + 1}`
            );
            details.removeAttribute("open");
          }

          alert(`${index + 1} - ${responseData.message}`);
        } else {
          console.log("🚀 ~ response not okay:", response);

          alert(
            `Fehler beim Senden des Formulars ${index + 1}. ${
              responseData.message
            }`
          );
        }
      } catch (error) {
        console.error(
          `Es gab einen Fehler beim Senden des Formulars ${index + 1}:`,
          error
        );
        alert(`Fehler beim Senden des Formulars ${index + 1}.`);
      }
    });
  });
  formsregie.forEach((form, index) => {
    form.addEventListener("submit", async function (event) {
      event.preventDefault(); // Verhindert das Neuladen der Seite

      const formData = new FormData(form);
      console.log("🚀 ~ formData:", formData);

      try {
        const response = await fetch(`/blockDetails/${index + 1}`, {
          method: "POST",
          body: formData,
        });

        const textResponse = await response.text();

        const responseData = JSON.parse(textResponse);

        if (response.ok) {
          console.log("🚀 ~ response okay:", response);

          if (formData.get("regie") !== "") {
            const regie = document.querySelector(
              `.sec${index + 1} .section-wrapper .card__container .regie`
            );
            regie.innerHTML = formData.get("regie");
            const details = document.querySelector(`#regieDetails${index + 1}`);
            details.removeAttribute("open");
          }

          alert(`${index + 1} - ${responseData.message}`);
        } else {
          console.log("🚀 ~ response not okay:", response);

          alert(
            `Fehler beim Senden des Formulars ${index + 1}. ${
              responseData.message
            }`
          );
        }
      } catch (error) {
        console.error(
          `Es gab einen Fehler beim Senden des Formulars ${index + 1}:`,
          error
        );
        alert(`Fehler beim Senden des Formulars ${index + 1}.`);
      }
    });
  });
  formsimg.forEach((form, index) => {
    form.addEventListener("submit", async function (event) {
      event.preventDefault(); // Verhindert das Neuladen der Seite

      const formData = new FormData(form);
      console.log("🚀 ~ formData:", formData);

      try {
        const response = await fetch(`/blockDetails/${index + 1}`, {
          method: "POST",
          body: formData,
        });

        const textResponse = await response.text();

        const responseData = JSON.parse(textResponse);

        if (response.ok) {
          console.log("🚀 ~ response okay:", response);

          const sourceJpg = document.querySelector(
            `.sec${index + 1} .section-wrapper .card .card__header picture source[type="image/jpg"]`
          );
          sourceJpg.srcset = responseData.path_jpg;

          const sourceWebp = document.querySelector(
            `.sec${index + 1} .section-wrapper .card .card__header picture source[type="image/webp"]`
          );
          sourceWebp.srcset = responseData.path_webp;

          const details = document.querySelector(`#imgDetails${index + 1}`);
          details.removeAttribute("open");

          alert(`${index + 1} - ${responseData.message}`);
        } else {
          console.log("🚀 ~ response not okay:", response);

          alert(
            `Fehler beim Senden des Formulars ${index + 1}. ${
              responseData.message
            }`
          );
        }
      } catch (error) {
        console.error(
          `Es gab einen Fehler beim LADEN des Formulars ${index + 1}:`,
          error
        );
        alert(`Fehler beim LADEN des Formulars ${index + 1}.`);
      }
    });
  });
};
