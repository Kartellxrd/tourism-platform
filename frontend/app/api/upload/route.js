import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { image } = await req.json();

    const formData = new FormData();
    formData.append('file', image);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'pula_tourism');

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: 'POST', body: formData }
    );

    const data = await res.json();

    if (data.secure_url) {
      return NextResponse.json({ url: data.secure_url });
    }

    return NextResponse.json({ message: 'Upload failed' }, { status: 500 });
  } catch {
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}