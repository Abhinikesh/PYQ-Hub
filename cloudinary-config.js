// Cloudinary Configuration
const cloudinaryConfig = {
  cloudName: 'diwacmg02', // Replace with your Cloudinary cloud name
  uploadPreset: 'pyq-uploads', // Create this in Cloudinary dashboard
  apiKey: 'br7p8-uEiK3HCdBoVwtYvbzvPx4', // Optional for client-side uploads
  maxFileSize: 10 * 1024 * 1024, // 10MB limit
  allowedFormats: ['pdf', 'jpg', 'jpeg', 'png']
};

// Cloudinary upload function
async function uploadToCloudinary(file) {
  console.log('Starting Cloudinary upload for file:', file.name);
  console.log('File size:', file.size, 'bytes');
  console.log('File type:', file.type);
  
  // Validate file size
  if (file.size > cloudinaryConfig.maxFileSize) {
    throw new Error(`File size (${file.size} bytes) exceeds maximum allowed size (${cloudinaryConfig.maxFileSize} bytes)`);
  }
  
  // Validate file type
  const fileExtension = file.name.split('.').pop().toLowerCase();
  if (!cloudinaryConfig.allowedFormats.includes(fileExtension)) {
    throw new Error(`File type ${fileExtension} is not allowed. Allowed types: ${cloudinaryConfig.allowedFormats.join(', ')}`);
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', cloudinaryConfig.uploadPreset);
  formData.append('cloud_name', cloudinaryConfig.cloudName);

  console.log('Upload URL:', `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/auto/upload`);
  console.log('Upload preset:', cloudinaryConfig.uploadPreset);

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/auto/upload`, {
      method: 'POST',
      body: formData
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cloudinary error response:', errorText);
      throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Cloudinary upload successful:', result);
    
    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      size: result.bytes
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
}

export { uploadToCloudinary, cloudinaryConfig }; 