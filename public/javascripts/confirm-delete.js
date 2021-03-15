function confirmDelete(id) {
  const confirmed = confirm('Are you sure you want to delete this post?');
  if (!confirmed) {
    return;
  } else {
    fetch('/edit/delete/' + id, {
      method: 'POST'
    }, {id: id})
    // location.reload();
   }
}

function setContent(doc) {
   var output = document.getElementById('output');
   output.innerHTML = doc;
}
