# File Uploader
This project is a simplified personal storage application, similar to Google Drive, where users can securely upload, organize, and access their files. Built with Node.js, Express, and Prisma, it demonstrates user authentication, session persistence, and file management capabilities.

<img src="https://github.com/user-attachments/assets/fed48ad9-933b-416e-bf1c-7e504f3ded8a" alt="File uploader flow" height="500" />


## Key Features
- **Session-based authentication**: secure login for users using Passport.js, with sessions stored in a database via Prisma's session store.
- **File upload and storage**: authenticated users can upload files, stored locally and organized into folders.
- **Folder management**: users can create and delete folders to organize their files.
- **File details and download**: users can view details (name, size, upload time) for each file and download them.
- **Cloud storage**: files can be uploaded to Cloudinary, with the URL saved in the database for efficient retrieval.

## How to Run the Project on a Local Machine

### Prerequisites

- Node.js installed on your machine.
- PostgreSQL database server installed and running.
- npm or yarn package manager.
- Cloudinary account (for cloud storage).

### Steps

1. **Clone the repository**:

```
git@github.com:dasha-solomkina/file-uploader.git
cd file-uploader
```

2. **Install dependencies**:

```
npm install
# or
yarn install
```

3. **Configure environment variables**:
 - Create a `.env` file in the root directory. Add the .env to the `.gitignore` file.
 - Add the following environment variables: DATABASE_URL and CLOUDINARY_URL.

4.  **Run database migrations**:
```
npx prisma migrate dev
```

5. **Start the development server**:
```
npm run dev
# or
yarn dev
```

5. **Open your browser** and navigate to http://localhost:3000 to see the project in action.

