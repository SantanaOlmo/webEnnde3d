document.addEventListener("DOMContentLoaded", () => {

  function dropHandler(ev) {
    ev.preventDefault();

    const file = ev.dataTransfer.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
      sessionStorage.setItem('uploadedModel', event.target.result);
      window.location.href = './views/viewer.html';
    };
    reader.readAsDataURL(file);
  }

  function dragOverHandler(ev) {
    ev.preventDefault();
    ev.target.classList.add("drag-over");
  }

  function dragEnterHandler(ev) {
    ev.preventDefault();
    ev.target.classList.add("drag-over");
  }

  function dragLeaveHandler(ev) {
    ev.target.classList.remove("drag-over");
  }

  const dropArea = document.getElementById('drop_zone');
  dropArea.addEventListener('dragover', dragOverHandler);
  dropArea.addEventListener('dragenter', dragEnterHandler);
  dropArea.addEventListener('dragleave', dragLeaveHandler);
  dropArea.addEventListener('drop', dropHandler);

});
