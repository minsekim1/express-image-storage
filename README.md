# express-image-storage
express-image-storage for image server (save to .avif)


# Upload Image API
- max size: 1024 x 1024
- to .avif (web minimum image format)

POST http://localhost:3000/upload
Body (form-data) Key: image, Value: File

# GET Image API
GET http://localhost:3000/images/logo.png