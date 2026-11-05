(() => {
  'use strict';
  if (window.__idecoPwaLoaded) return;
  window.__idecoPwaLoaded = true;
  let promptEvent = null;
  let button;
  const standalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault(); promptEvent = event;
    if (button) button.hidden = standalone();
  });
  window.addEventListener('appinstalled', () => {
    promptEvent = null; if (button) button.hidden = true;
  });
  function init() {
    if ('serviceWorker' in navigator && window.isSecureContext) {
      navigator.serviceWorker.register('/tracuugia-mobile/sw.js', {
        scope: '/tracuugia-mobile/', updateViaCache: 'none'
      }).catch(error => console.warn('IDECO PWA: chưa đăng ký được service worker', error));
    }
    if (standalone()) return;
    // Đặt nút trong luồng trang, không che nút điều khiển ứng dụng.
    const box = document.createElement('div');
    box.style.cssText = 'padding:12px;text-align:center;font:14px system-ui';
    button = document.createElement('button');
    button.type = 'button';
    button.textContent = 'Cài IDECO WEB HUB trên điện thoại';
    button.style.cssText = 'background:#ba1830;color:white;border:0;border-radius:12px;padding:12px 18px;font:600 15px system-ui;cursor:pointer';
    const note = document.createElement('p');
    note.setAttribute('role', 'status');
    button.addEventListener('click', async () => {
      if (promptEvent) {
        const saved = promptEvent; promptEvent = null;
        try {
          await saved.prompt();
          const result = await saved.userChoice;
          note.textContent = result.outcome === 'accepted' ? 'Đã chấp nhận yêu cầu cài đặt.' : 'Anh có thể cài lại từ menu trình duyệt.';
        } catch (_) { note.textContent = 'Vui lòng cài từ menu trình duyệt.'; }
      } else {
        const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        note.textContent = ios
          ? 'iPhone/iPad: mở bằng Safari → Chia sẻ → Thêm vào Màn hình chính → bật Mở dưới dạng ứng dụng web nếu có → Thêm.'
          : 'Trong Chrome: mở menu ⋮ → Cài đặt ứng dụng hoặc Thêm vào màn hình chính. Nếu chưa thấy, tải lại trang sau khi website cập nhật xong.';
      }
    });
    box.append(button, note); const header = document.querySelector('body > header'); if (header) header.after(box); else document.body.prepend(box);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();
