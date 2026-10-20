// 학생들이 제출한 이미지를 선생님 구글 드라이브 폴더에 저장하는 Apps Script
// 드라이브에서 폴더를 만든 뒤, 주소창 .../folders/<여기가 ID> 를 아래에 붙여 넣으세요.
const FOLDER_ID = '여기에_드라이브_폴더_ID';
const MAX_BYTES = 15 * 1024 * 1024; // 한 장 최대 15MB

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const bytes = Utilities.base64Decode(body.image);
    if (bytes.length > MAX_BYTES) throw new Error('파일이 너무 커요.');
    const name = clean(body.filename || 'photo.jpg');
    const mime = /^image\/[a-z0-9.+-]+$/i.test(body.mime || '') ? body.mime : 'image/jpeg';
    const blob = Utilities.newBlob(bytes, mime, name);
    const file = targetFolder(body.subfolder).createFile(blob);
    return json({ ok: true, id: file.getId() });
  } catch (err) {
    return json({ ok: false, error: String(err.message || err) });
  }
}

// "개별사진/3학년2반_홍길동_20261022_101500" 처럼 / 로 구분된 하위 폴더를 없으면 만들며 찾아감
function targetFolder(subfolder) {
  let folder = DriveApp.getFolderById(FOLDER_ID);
  if (!subfolder) return folder;
  String(subfolder).split('/').map(clean).filter(Boolean).forEach(function (n) {
    const it = folder.getFoldersByName(n);
    folder = it.hasNext() ? it.next() : folder.createFolder(n);
  });
  return folder;
}

function clean(s) { return String(s).replace(/[\\:*?"<>|]/g, '_').slice(0, 80); }

function doGet() { return json({ ok: true, msg: 'ready' }); }

function json(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
