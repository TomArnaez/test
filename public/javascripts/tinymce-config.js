function getSyncScriptParams() {
         var scripts = document.getElementsByTagName('script');
         var lastScript = scripts[scripts.length-1];
         var scriptName = lastScript;
         return {
             content : scriptName.getAttribute('data-content')
         };
 }

tinymce.init({
    selector: 'textarea#my-expressjs-tinymce-app',
    height: 500,
    menubar: ['file', 'insert'],
    plugins: [
        'advlist autolink lists link image charmap print preview anchor',
        'searchreplace visualblocks code fullscreen',
        'insertdatetime media table paste code help wordcount',
        'media',
        'save'
    ],
    toolbar: ['undo redo | formatselect | ' +
        'bold italic backcolor | alignleft aligncenter ' +
        'alignright alignjustify | bullist numlist outdent indent | ' +
        'removeformat | help' +
        ' | save'],
    setup: function (editor) {
      editor.on('init', function (e) {
        var script_tag = document.getElementById('config')
        var document_to_load = script_tag.getAttribute('data-content');
        editor.setContent(document_to_load);
      });
    }
});

function setContent(content) {
  tinymce.activeEditor.setContent(content);
}
