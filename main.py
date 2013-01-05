#!/usr/bin/env python
#
# Copyright 2007 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
import webapp2

class MainHandler(webapp2.RequestHandler):
    def get(self):
        self.response.out.write('Hello world!')

# 
# from reportlab.pdfgen import canvas
# from reportlab.lib.pagesizes import portrait
# 
# class PDFHandler(webapp2.RequestHandler):
#   def get(self):
#     self.response.headers['Content-Type'] = 'application/pdf'
#     self.response.headers['Content-Disposition'] = 'attachment; filename=my.pdf'
#     c = canvas.Canvas(self.response.out, pagesize=portrait)
# 
#     c.drawString(100, 100, "Hello world")
#     c.showPage()
#     c.save()
    
app = webapp2.WSGIApplication([
    ('/', MainHandler),
    #('/pdf', PDFHandler)
  ],
  debug=True)
