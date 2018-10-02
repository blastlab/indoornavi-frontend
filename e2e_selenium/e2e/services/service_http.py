import requests


class ServiceHttp:

    def http_login(self, url, payload):
        session = requests.Session()
        headers = {'content-type': 'application/json', 'Accept': 'application/json'}
        request = session.post(url, data=payload, headers=headers)
        print(request.text)
        cookies = session.cookies.RequestsCookieJar()
        print("cookies: " + str(cookies))
        session.post('http://localhost:90/rest/v1/auth', cookies=cookies)
        return cookies


