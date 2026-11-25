#!/usr/bin/env python3
"""เปิดเกมเวอร์ชันแยกไฟล์ — ดับเบิลคลิกไฟล์นี้ แล้วเบราว์เซอร์จะเปิดเกมให้เอง
หยุดเซิร์ฟเวอร์ด้วย Ctrl+C"""
import http.server, socketserver, webbrowser, os, threading

PORT = 8765
os.chdir(os.path.dirname(os.path.abspath(__file__)))

class H(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')   # เห็นผลแก้โค้ดทันทีที่รีเฟรช
        super().end_headers()
    def log_message(self, *a):
        pass

socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(('127.0.0.1', PORT), H) as httpd:
    url = 'http://localhost:%d/index.html' % PORT
    print('MY COMPANY TYCOON กำลังรันที่  ' + url)
    print('กด Ctrl+C เพื่อหยุด')
    threading.Timer(1.0, lambda: webbrowser.open(url)).start()
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print('\nหยุดเซิร์ฟเวอร์แล้ว')
