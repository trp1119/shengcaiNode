let http = require('http')
let fs = require('fs')
let request = require('request')
let path = require('path')
let cheerio = require('cheerio')

let url = 'http://e.100xuexi.com/DigitalLibrary/BookList.aspx?id=547'

http.get(url, res => {
  let html = ''
  // 获取所有书籍页
  res.on('data', chuck => {
    html += chuck
  })
  res.on('end', () => {
    let $ = cheerio.load(html)
    $('#ContentPlaceHolder1_BookList a').each(function () {
      // 查找书籍 id
      let bookId = $(this).attr('href').match(/Ebook\/(\S*).html/)[1]
      let bookName = $(this).text()
      // 形成书籍展示页面链接
      let showUrl = 'http://e.100xuexi.com/workshop/showNew.aspx?id=' + bookId
      http.get(showUrl, res => {
        let showHtml = ''
        res.on('data', chuck => {
          showHtml += chuck
        })
        res.on('end', () => {
          let $$ = cheerio.load(showHtml)
          let bookRealPath = showHtml.match(/[a-f0-9]{32}/)
          if (bookRealPath !== null) {
            let downEpubUrl = 'http://e.100xuexi.com/uploads/ebook/' + bookRealPath[0] + '/mobile/' + bookRealPath[0] + '.epub'
            var stream = fs.createWriteStream(bookName + '.epub')
            request(downEpubUrl).pipe(stream).on('close', () => {
              console.log(bookId + '下载完成')
            })
          } else {
            // console.log('err', bookId)
          }
          // console.log(bookRealPath[0])
        })
      })
    })
  })
}).on('error', err => {
  // 处理错误
  console.log(err.message)
})