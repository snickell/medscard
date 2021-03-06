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
import os
import logging

import webapp2
from google.appengine.ext import db
from google.appengine.api import users
from google.appengine.api import images

import jinja2
import os

jinja_environment = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)))

class UserPrefs(db.Model):
    userid = db.StringProperty()
    faceplate = db.BlobProperty()
    
class MainHandler(webapp2.RequestHandler):
    def get(self):
        user = users.get_current_user()

        if user:
            # self.response.headers['Content-Type'] = 'text/plain'
            # self.response.out.write('Hello, ' + user.nickname())
            q = db.GqlQuery("SELECT * FROM UserPrefs WHERE userid = :1", user.user_id())
            userprefs = q.get()
            
            url = users.create_logout_url(self.request.uri)
            url_linktext = 'Logout'

            template_values = {
                'greetings': "From earth",
                'url': url,
                'url_linktext': url_linktext,
                'logout_url': users.create_logout_url("/")
            }

            template = jinja_environment.get_template('index.html')
            self.response.out.write(template.render(template_values))
        else:
            self.redirect(users.create_login_url(self.request.uri))
            
class UploadFaceplateHandler(webapp2.RequestHandler):
    def get(self):
        user = users.get_current_user()

        if user:
            template_values = {
                'message': ''
            }
            
            template = jinja_environment.get_template('upload-faceplate.html')
            self.response.out.write(template.render(template_values))
        else:
            self.redirect(users.create_login_url(self.request.uri))
            
    def post(self):
        user = users.get_current_user()

        if user:
            faceplate = self.request.get('faceplate')
            
            q = db.GqlQuery("SELECT * FROM UserPrefs WHERE userid = :1", user.user_id())
            userprefs = q.get()
            
            if userprefs == None:
                logging.debug("Creating UserPrefs for %s" % (user.user_id()))
                userprefs = UserPrefs(userid=user.user_id())
            
            userprefs.faceplate = db.Blob(faceplate)
            userprefs.put()

            template_values = {
                'message' : 'Faceplate changed.'
            }                    
            template = jinja_environment.get_template('upload-faceplate.html')
            self.response.out.write(template.render(template_values))
        else:
            self.redirect(users.create_login_url(self.request.uri))

class FaceplateHandler(webapp2.RequestHandler):
    def get(self):
        user = users.get_current_user()
        
        if user:
            self.response.headers['Content-Type'] = 'image/png'
            q = db.GqlQuery("SELECT * FROM UserPrefs WHERE userid = :1", user.user_id())
            userprefs = q.get()
            
            if userprefs is not None and userprefs.faceplate is not None:
                self.response.headers['Content-Type'] = 'image/png'
                self.response.out.write(userprefs.faceplate)
            else:
                self.redirect('/images/default-faceplate.png')

        else:
            self.error(404)

logging.getLogger().setLevel(logging.DEBUG)
app = webapp2.WSGIApplication([
    ('/', MainHandler),
    ('/upload-faceplate', UploadFaceplateHandler),
    ('/faceplate', FaceplateHandler)
    #('/pdf', PDFHandler)
  ],
  debug=True)
