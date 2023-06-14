const API_KEY = 'YOUR_API_KEY' // https://1fichier.com/console/params.pl
const ROOT_FOLDER_ID = '0' // 0 = root folder

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  let pathname = url.pathname
  if (pathname.endsWith('/')) {
    pathname = pathname.slice(0, -1)
  }
  const path = decodeURIComponent(pathname).split('/').filter(Boolean)

  async function findFolder(id, path) {
    const response = await fetch(`https://api.1fichier.com/v1/folder/ls.cgi`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        folder_id: id,
        files: 1
      })
    })
    const data = await response.json()
    if (path.length === 0) {
      return data
    }
    const nextFolderName = path[0]
    if (Array.isArray(data.sub_folders)) {
      for (const item of data.sub_folders) {
        if (item.name === nextFolderName) {
          return findFolder(item.id, path.slice(1))
        }
      }
    }
    return null
  }

  async function findFile(id, path) {
    const data = await findFolder(id, path.slice(0, -1))
    if (data && Array.isArray(data.items)) {
      for (const item of data.items) {
        if (item.filename === path[path.length - 1]) {
          return item
        }
      }
    }
    return null
  }

  if (request.method === 'GET' && path.length > 0) {
    const file = await findFile(ROOT_FOLDER_ID, path)
    if (file) {
      const response = await fetch(`https://api.1fichier.com/v1/download/get_token.cgi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          url: file.url,
          inline: 1
        })
      })
      const data = await response.json()
      if (data.status === 'OK') {
        const fileResponse = await fetch(data.url)
        return new Response(fileResponse.body, {headers: {'Content-Type': file['content-type'], 'Access-Control-Allow-Origin': '*'}})
      } else {
        return new Response(data.message)
      }
    }
  }

  const data = await findFolder(ROOT_FOLDER_ID, path)
  let html = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body><h1>Index of /${path.join('/')}</h1><ul>`
  if (path.length > 0) {
    html += `<li><a href="${pathname.split('/').slice(0, -1).join('/')}">../</a></li>`
  }
  if (data) {
    if (Array.isArray(data.sub_folders)) {
      for (const item of data.sub_folders) {
        html += `<li><a href="/${path.length > 0 ? path.join('/') + '/' : ''}${item.name}">${item.name}/</a></li>`
      }
    }
    if (Array.isArray(data.items)) {
      for (const item of data.items) {
        html += `<li><a href="/${path.length > 0 ? path.join('/') + '/' : ''}${item.filename}">${item.filename}</a></li>`
      }
    }
  } else {
    html += `<li>Folder not found</li>`
  }
  html += `</ul></body></html>`
  return new Response(html, {headers: {'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*'}})
}