export function initViewerMenus() {
  const btnWorld = document.getElementById('btn-world');
  const menuPanel = document.getElementById('menuPanel');

  btnWorld.addEventListener('click', () => {
    menuPanel.classList.toggle('show');
  });
}
