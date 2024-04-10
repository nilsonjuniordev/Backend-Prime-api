// Configure o middleware de upload do multer para o campo uploadsPathAso
const uploadAso = multer({ 
    storage: multer.diskStorage({
      destination: function (req, file, cb) {
        const userId = req.headers.userid;
  
        if (!userId) {
          return cb(new Error('UserId não fornecido'));
        }
  
        const userUploadsDir = `uploads/aso/${userId}`;
  
        // Cria o diretório se não existir
        if (!fs.existsSync(userUploadsDir)) {
          fs.mkdirSync(userUploadsDir, { recursive: true });
        }
  
        cb(null, userUploadsDir);
      },
      filename: function (req, file, cb) {
        const userId = req.headers.userid;
  
        if (!userId) {
          return cb(new Error('UserId não fornecido'));
        }
  
        // Formata a data e hora com moment.js
        const formattedTimestamp = moment().format('YYYYMMDD_HHmmss');
  
        // Obtém a extensão do arquivo
        const extension = path.extname(file.originalname);
  
        // Cria um identificador único
        const uniqueIdentifier = Math.random().toString(36).substring(2, 7); // Gerador de identificador único
  
        // Cria o novo nome do arquivo com o identificador único
        const newFilename = `${userId}_${formattedTimestamp}_${uniqueIdentifier}${extension}`;
  
        cb(null, newFilename);
      }
    }) 
  });
  
  // Rota de upload para uploadsPathAso
  app.post('/uploads/aso', uploadAso.array('files', 10), async (req, res) => {
    try {
      const userId = req.body.userId;
      const files = req.files;
  
      if (!userId) {
        return res.status(400).json({ error: 'UserId não fornecido' });
      }
  
      if (!files || files.length === 0) {
        return res.status(400).json({ error: 'Arquivos não enviados' });
      }
  
      console.log(`Arquivos recebidos para o usuário ${userId}`);
  
      // Verifica se files está definido antes de chamar map
      const uploadPaths = files ? files.map(file => file.path) : [];
  
      console.log('userId:', userId);
      console.log('uploadPaths:', uploadPaths);
  
      const formattedUploadPaths = uploadPaths.map(path => path.replace(/\\/g, '/')).join(', ');
      const updateUserUploadPathAso = `UPDATE user SET uploadsPathAso = IFNULL(CONCAT_WS(', ', uploadsPathAso, ?), ?) WHERE iduser = ?`;
      await db.query(updateUserUploadPathAso, [formattedUploadPaths, formattedUploadPaths, userId]);
  
      res.status(200).json({ success: 'Arquivos recebidos com sucesso' });
    } catch (error) {
      console.error('Erro durante o processamento dos uploads:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });
  