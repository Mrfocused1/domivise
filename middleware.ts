declare const process: {
  env: {
    ADMIN_BASIC_USER?: string;
    ADMIN_BASIC_PASSWORD?: string;
  };
};

export const config = {
  matcher: ['/admin.html', '/admin']
};

function unauthorized() {
  return new Response('Authentication required.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="DomiVise Admin", charset="UTF-8"',
      'Cache-Control': 'no-store'
    }
  });
}

function constantTimeEqual(left: string, right: string) {
  var maxLength = Math.max(left.length, right.length);
  var mismatch = left.length === right.length ? 0 : 1;
  for (var index = 0; index < maxLength; index += 1) {
    mismatch |= (left.charCodeAt(index) || 0) ^ (right.charCodeAt(index) || 0);
  }
  return mismatch === 0;
}

export default function middleware(request: Request) {
  var expectedUser = process.env.ADMIN_BASIC_USER;
  var expectedPassword = process.env.ADMIN_BASIC_PASSWORD;
  if (!expectedUser && !expectedPassword) return;
  if (!expectedUser || !expectedPassword) return unauthorized();

  var authorization = request.headers.get('authorization') || '';
  if (authorization.indexOf('Basic ') !== 0) return unauthorized();

  var decoded;
  try {
    decoded = atob(authorization.slice(6));
  } catch (error) {
    return unauthorized();
  }
  var separator = decoded.indexOf(':');
  if (separator === -1) return unauthorized();

  var suppliedUser = decoded.slice(0, separator);
  var suppliedPassword = decoded.slice(separator + 1);

  if (
    constantTimeEqual(suppliedUser, expectedUser) &&
    constantTimeEqual(suppliedPassword, expectedPassword)
  ) {
    return;
  }

  return unauthorized();
}
