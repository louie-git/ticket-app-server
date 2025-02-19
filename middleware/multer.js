import multer from 'multer'
import fs from 'fs'
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const storage = multer.diskStorage({

  destination: async function (req, files, cb) {
    const dir = path.join(__dirname, '../uploads')
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir)
  },
  filename: function (req, files, cb) {
    const filename = (`${uuidv4().split('-')[1]}-${files.originalname}`).replaceAll(' ', '-')
    cb(null, filename)
  }
})


const fileFilter =  (req, files, cb) => {
  console.log('hererrer',files, req.files)
  const allowedFileTypes = ['image/jpeg', 'image/png']
  if(!allowedFileTypes.includes(files.mimetype)) {
    cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', files), false)
  } 
  else cb(null,true)
}
const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 500 * 1024,
    files: 2
  },
  fileFilter: fileFilter
})




export default upload