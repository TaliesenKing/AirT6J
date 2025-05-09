//this file will allow fetch requests wth verbs other than GET. 

import Cookies from 'js-cookie';

export async function csrfFetch(url, options = {}) {
    //if there isnt a method, then default to GET
options.method = options.method || 'GET';
options.headers = options.headers || {};
    //if it is a method other than GET, then set the XSRF-TOKEN header on the options object
    if (options.method.toUpperCase() !== 'GET') {
        options.headers['Content-Type'] =
          options.headers['Content-Type'] || 'application/json';
        options.headers['XSRF-Token'] = Cookies.get('XSRF-TOKEN');
      }
      //then we have to call the default window's fetch with the url and options that it passed in
      const res = await window.fetch(url, options);


      //if the response code is 400 or above then we know its an error and we can throw an error
      //with the error being the response
      if (res.status >= 400) throw res;

      //if that boolean returns false then we return whatever response to the next promise chain
      return res;
}
// call this to get the "XSRF-TOKEN" cookie, should only be used in development
export function restoreCSRF() {
    return csrfFetch('/api/csrf/restore');
  }
