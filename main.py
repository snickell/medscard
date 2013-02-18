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

import webapp2
from google.appengine.ext import db
from google.appengine.api import users

import jinja2
import os

jinja_environment = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)))

class UserPrefs(db.Model):
    userid = db.StringProperty()
    
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
            }

            template = jinja_environment.get_template('index.html')
            self.response.out.write(template.render(template_values))
        else:
            self.redirect(users.create_login_url(self.request.uri))
    
app = webapp2.WSGIApplication([
    ('/', MainHandler),
    #('/pdf', PDFHandler)
  ],
  debug=True)
