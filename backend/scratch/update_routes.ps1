$path = "c:\Users\AbuZar\Desktop\Fyp\trek pal\Trekpal\backend\src\modules\auth\auth.routes.ts"
$content = Get-Content $path -Raw
$content = $content -replace "import { uploadKycDocuments } from '../../middlewares/upload.middleware';", "import { uploadKycDocuments, uploadHotelDocuments } from '../../middlewares/upload.middleware';"
$content = $content -replace "agencyRegisterSchema,", "agencyRegisterSchema,`r`n  hotelRegisterSchema,"
$content = $content -replace "router.post\(\s+'/register/agency',", "/**`r`n * @route   POST /api/auth/register/hotel`r`n * @desc    Register a new independent hotel`r`n * @access  Public`r`n */`r`nrouter.post(`r`n  '/register/hotel',`r`n  uploadHotelDocuments as any,`r`n  validateBody(hotelRegisterSchema.shape.body),`r`n  authController.registerHotel.bind(authController)`r`n);`r`n`r`nrouter.post(`r`n  '/register/agency',"
$content | Set-Content $path -NoNewline
