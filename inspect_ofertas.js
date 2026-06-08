// Native fetch is available in modern Node.js

async function main() {
  const url = 'http://localhost:1337/uploads/fragancias_img_1e517f2a0a.png';
  console.log('Fetching image:', url);
  try {
    const res = await fetch(url);
    console.log('Image status:', res.status, res.headers.get('content-type'));
  } catch (err) {
    console.error('Error:', err);
  }
}

main();
