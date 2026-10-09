# Flood Rescue Coordination and Relief Management System - Frontend

## 🌐 Danh Sách Website Deploy (Netlify)

1. **Hệ Thống Quản Lý Cứu Hộ (Admin / Điều Phối / Cứu Trợ)**:
   - **URL Trực Tiếp**: [https://hethongcuuho.netlify.app](https://hethongcuuho.netlify.app)
   - **Thư mục source**: `fe_fload_admin/`
   - **Netlify Site ID**: `03eb2a04-abfe-4ff9-87cf-8a19c828296d`
   - **API Backend**: `https://bebaolu.onrender.com`

2. **Cổng Cứu Hộ Bão Lũ Dành Cho Người Dân / Khách**:
   - **URL Trực Tiếp**: [https://cuuhobaolucus.netlify.app](https://cuuhobaolucus.netlify.app)
   - **Thư mục source**: `FE/`
   - **Netlify Site ID**: `f633dd7a-410f-4a75-9436-e4a157c91e58`
   - **API Backend**: `https://bebaolu.onrender.com`

---

## 🚀 Hướng Dẫn Build & Deploy Nhanh

### 1. Deploy trang Admin (Hệ Thống Cứu Hộ)
```bash
cd fe_fload_admin
npm install
npm run build
netlify deploy --prod --dir dist --site 03eb2a04-abfe-4ff9-87cf-8a19c828296d
```

### 2. Deploy trang Khách (Cứu Hộ Bão Lũ)
```bash
cd FE
npm install
npm run build
netlify deploy --prod --dir dist --site f633dd7a-410f-4a75-9436-e4a157c91e58
```
