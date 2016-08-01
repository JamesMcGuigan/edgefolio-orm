/**
 * @source https://github.com/prettymuchbryce/node-http-status/blob/master/index.js
 *
 * Constants enumerating the HTTP status codes.
 *
 * All status codes defined in RFC1945 (HTTP/1.0, RFC2616 (HTTP/1.1),
 * and RFC2518 (WebDAV) are supported.
 *
 * Based on the org.apache.commons.httpclient.HttpStatus Java API.
 *
 * Ported by Bryce Neal.
 */
angular.module('edgefolio.constants.HttpStatusCodes', [])
.service('HttpStatusCodes', function() {
  var statusCodes = {};

  statusCodes[this.ACCEPTED = 202] = "Accepted";
  statusCodes[this.BAD_GATEWAY = 502] = "Bad Gateway";
  statusCodes[this.BAD_REQUEST = 400] = "Bad Request";
  statusCodes[this.CONFLICT = 409] = "Conflict";
  statusCodes[this.CONTINUE = 100] = "Continue";
  statusCodes[this.CREATED = 201] = "Created";
  statusCodes[this.EXPECTATION_FAILED = 417] = "Expectation Failed";
  statusCodes[this.FAILED_DEPENDENCY  = 424] = "Failed Dependency";
  statusCodes[this.FORBIDDEN = 403] = "Forbidden";
  statusCodes[this.GATEWAY_TIMEOUT = 504] = "Gateway Timeout";
  statusCodes[this.GONE = 410] = "Gone";
  statusCodes[this.HTTP_VERSION_NOT_SUPPORTED = 505] = "HTTP Version Not Supported";
  statusCodes[this.INSUFFICIENT_SPACE_ON_RESOURCE = 419] = "Insufficient Space on Resource";
  statusCodes[this.INSUFFICIENT_STORAGE = 507] = "Insufficient Storage";
  statusCodes[this.INTERNAL_SERVER_ERROR = 500] = "Server Error";
  statusCodes[this.LENGTH_REQUIRED = 411] = "Length Required";
  statusCodes[this.LOCKED = 423] = "Locked";
  statusCodes[this.METHOD_FAILURE = 420] = "Method Failure";
  statusCodes[this.METHOD_NOT_ALLOWED = 405] = "Method Not Allowed";
  statusCodes[this.MOVED_PERMANENTLY = 301] = "Moved Permanently";
  statusCodes[this.MOVED_TEMPORARILY = 302] = "Moved Temporarily";
  statusCodes[this.MULTI_STATUS = 207] = "Multi-Status";
  statusCodes[this.MULTIPLE_CHOICES = 300] = "Multiple Choices";
  statusCodes[this.NETWORK_AUTHENTICATION_REQUIRED = 511] = "Network Authentication Required";
  statusCodes[this.NO_CONTENT = 204] = "No Content";
  statusCodes[this.NON_AUTHORITATIVE_INFORMATION = 203] = "Non Authoritative Information";
  statusCodes[this.NOT_ACCEPTABLE = 406] = "Not Acceptable";
  statusCodes[this.NOT_FOUND = 404] = "Not Found";
  statusCodes[this.NOT_IMPLEMENTED = 501] = "Not Implemented";
  statusCodes[this.NOT_MODIFIED = 304] = "Not Modified";
  statusCodes[this.OK = 200] = "OK";
  statusCodes[this.PARTIAL_CONTENT = 206] = "Partial Content";
  statusCodes[this.PAYMENT_REQUIRED = 402] = "Payment Required";
  statusCodes[this.PRECONDITION_FAILED = 412] = "Precondition Failed";
  statusCodes[this.PRECONDITION_REQUIRED = 428] = "Precondition Required";
  statusCodes[this.PROCESSING = 102] = "Processing";
  statusCodes[this.PROXY_AUTHENTICATION_REQUIRED = 407] = "Proxy Authentication Required";
  statusCodes[this.REQUEST_HEADER_FIELDS_TOO_LARGE = 431] = "Request Header Fields Too Large";
  statusCodes[this.REQUEST_TIMEOUT = 408] = "Request Timeout";
  statusCodes[this.REQUEST_TOO_LONG = 413] = "Request Entity Too Large";
  statusCodes[this.REQUEST_URI_TOO_LONG = 414] = "Request-URI Too Long";
  statusCodes[this.REQUESTED_RANGE_NOT_SATISFIABLE = 416] = "Requested Range Not Satisfiable";
  statusCodes[this.RESET_CONTENT = 205] = "Reset Content";
  statusCodes[this.SEE_OTHER = 303] = "See Other";
  statusCodes[this.SERVICE_UNAVAILABLE = 503] = "Service Unavailable";
  statusCodes[this.SWITCHING_PROTOCOLS = 101] = "Switching Protocols";
  statusCodes[this.TEMPORARY_REDIRECT = 307] = "Temporary Redirect";
  statusCodes[this.TOO_MANY_REQUESTS = 429] = "Too Many Requests";
  statusCodes[this.UNAUTHORIZED = 401] = "Unauthorized";
  statusCodes[this.UNPROCESSABLE_ENTITY = 422] = "Unprocessable Entity";
  statusCodes[this.UNSUPPORTED_MEDIA_TYPE = 415] = "Unsupported Media Type";
  statusCodes[this.USE_PROXY = 305] = "Use Proxy";

  this.getStatusText = function(statusCode) {
    if (statusCodes.hasOwnProperty(statusCode)) {
      return statusCodes[statusCode];
    } else {
      console.log('HttpStatusCodes.js::getStatusText()', 'Status code does not exist: ', statusCode);
      return "";
    }
  };
});
