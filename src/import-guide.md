# Hướng dẫn import code vào Bolt.DIY

## Phương pháp 1: Sao chép thủ công

1. **Tải xuống code từ Bolt**: 
   - Trong ứng dụng Bolt, tìm nút "Download" hoặc "Export" để tải code về máy tính của bạn
   - Hoặc sao chép từng file riêng lẻ

2. **Import vào Bolt.DIY**:
   - Mở Bolt.DIY trên máy local của bạn
   - Tạo project mới hoặc mở project hiện có
   - Sao chép nội dung từng file vào Bolt.DIY

## Phương pháp 2: Sử dụng tính năng import của Bolt.DIY

Nếu Bolt.DIY có tính năng import:
1. Tìm nút "Import" hoặc "Upload" trong giao diện
2. Chọn file ZIP hoặc thư mục chứa code bạn đã tải về
3. Làm theo hướng dẫn trên màn hình để hoàn tất quá trình import

## Phương pháp 3: Sử dụng script đơn giản

Nếu bạn có nhiều file cần import, bạn có thể sử dụng script Node.js để tự động hóa quá trình:
```javascript
const fs = require('fs');
const path = require('path');

// Đường dẫn đến thư mục chứa code bạn muốn import
const sourcePath = './source-code';
// Đường dẫn đến thư mục project trong Bolt.DIY
const destPath = './bolt-diy-project';

// Hàm đệ quy để sao chép tất cả file và thư mục
function copyRecursive(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest);
    }
    fs.readdirSync(src).forEach(function(childItemName) {
      copyRecursive(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    fs.copyFileSync(src, dest);
    console.log(`Copied: ${src} -> ${dest}`);
  }
}

// Thực hiện sao chép
try {
  copyRecursive(sourcePath, destPath);
  console.log('Import completed successfully!');
} catch (err) {
  console.error('Error during import:', err);
}
```

## Lưu ý quan trọng

- Đảm bảo cấu trúc thư mục phù hợp với yêu cầu của Bolt.DIY
- Kiểm tra các dependency trong package.json và cài đặt chúng nếu cần
- Một số tính năng có thể cần điều chỉnh để hoạt động trong môi trường local
