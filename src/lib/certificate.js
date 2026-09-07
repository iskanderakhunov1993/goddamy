export function downloadCertificate({ name, courseTitle }) {
  if (typeof document === "undefined") return;
  const canvas = document.createElement("canvas");
  canvas.width = 1600;
  canvas.height = 1120;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#f4f3ee";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#1f1c46";
  ctx.lineWidth = 6;
  ctx.strokeRect(48, 48, canvas.width - 96, canvas.height - 96);
  ctx.strokeStyle = "#f4c92e";
  ctx.lineWidth = 2;
  ctx.strokeRect(70, 70, canvas.width - 140, canvas.height - 140);

  ctx.fillStyle = "#1f1c46";
  ctx.font = "700 34px Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText("GODEMY", canvas.width / 2, 190);

  ctx.font = "italic 26px Georgia, serif";
  ctx.fillStyle = "#57527a";
  ctx.fillText("Сертификат о прохождении курса", canvas.width / 2, 250);

  ctx.font = "700 64px Georgia, serif";
  ctx.fillStyle = "#1f1c46";
  ctx.fillText(name || "Гость Godemy", canvas.width / 2, 430);

  ctx.font = "26px Georgia, serif";
  ctx.fillStyle = "#3a355e";
  ctx.fillText("успешно завершил(-а) курс", canvas.width / 2, 500);

  ctx.font = "700 44px Georgia, serif";
  ctx.fillStyle = "#1f1c46";
  ctx.fillText(courseTitle, canvas.width / 2, 570);

  const issued = new Date().toLocaleDateString("ru-RU", { year: "numeric", month: "long", day: "numeric" });
  ctx.font = "22px Georgia, serif";
  ctx.fillStyle = "#57527a";
  ctx.fillText(`Дата выдачи: ${issued}`, canvas.width / 2, 660);

  ctx.font = "16px Georgia, serif";
  ctx.fillStyle = "#8b866f";
  ctx.fillText("Сертификат подтверждает прохождение учебной программы Godemy и не заменяет диплом об образовании.", canvas.width / 2, canvas.height - 110);

  const link = document.createElement("a");
  link.download = `godemy-certificate-${(courseTitle || "course").toLowerCase().replace(/[^a-zа-я0-9]+/gi, "-")}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}
