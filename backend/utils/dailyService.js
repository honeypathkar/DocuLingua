const axios = require("axios");
const transporter = require("./transporter");
const supabase = require("./supabase");

const BUCKET = "doculingua";
const FILE_NAME = "daily/daily.jpg";

async function uploadFile() {
  try {
    await supabase.storage.from(BUCKET).remove([FILE_NAME]);

    const response = await axios.get(`${process.env.APP_URL}/daily.jpg`, {
      responseType: "arraybuffer",
    });
    const fileBuffer = Buffer.from(response.data);

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(FILE_NAME, fileBuffer, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(FILE_NAME);

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.NOTIFY_EMAIL,
      subject: "Daily Image Uploaded ✅",
      text: `The daily image has been uploaded successfully.\n\nURL: ${urlData.publicUrl}`,
    });

    console.log("✅ File uploaded and email sent");
  } catch (err) {
    console.error("❌ Error uploading file:", err);

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.NOTIFY_EMAIL,
      subject: "Daily Image Upload Failed ❌",
      text: `An error occurred:\n${err.message}`,
    });

    throw err;
  }
}

module.exports = { uploadFile };
