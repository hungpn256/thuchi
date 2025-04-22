// Script đơn giản để xử lý theme color cho PWA
// Script này sẽ chạy trước khi ứng dụng React load

(function () {
  try {
    // Kiểm tra xem có localStorage không
    if ('localStorage' in window) {
      // Lấy theme color từ localStorage (nếu có)
      const savedThemeColor = localStorage.getItem('thuchi-theme-color');

      if (savedThemeColor) {
        // Cập nhật meta tag ngay khi trang bắt đầu load
        let metaThemeColor = document.querySelector('meta[name="theme-color"]');

        if (!metaThemeColor) {
          metaThemeColor = document.createElement('meta');
          metaThemeColor.setAttribute('name', 'theme-color');
          document.head.appendChild(metaThemeColor);
        }

        metaThemeColor.setAttribute('content', savedThemeColor);
      }

      // Thay đổi màu dựa vào dark mode của hệ thống
      // nếu người dùng chưa từng vào trang (không có savedThemeColor)
      if (!savedThemeColor) {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          // Dark mode
          let metaThemeColor = document.querySelector('meta[name="theme-color"]');

          if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta');
            metaThemeColor.setAttribute('name', 'theme-color');
            document.head.appendChild(metaThemeColor);
          }

          metaThemeColor.setAttribute('content', '#18181b');
        }
      }
    }
  } catch (error) {
    console.error('Error in PWA theme script:', error);
  }
})();
