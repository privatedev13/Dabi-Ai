const pinterestCookies = [
  'csrftoken=f860f505f91304ab951e560bd632fc12',
  '_routing_id="62b86408-7b60-447b-aa77-e55388b89dc6"',
  'sessionFunnelEventLogged=1',
  'g_state={"i_l":0}',
  '_auth=1',
  '_pinterest_sess=TWc9PSZ...',
  '__Secure-s_a=eTRNSHVae...',
  '_b="AYieXjdvBm1P..."'
].join('; ');

const pinterestHeaders = {
  'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Mobile Safari/537.36',
  'Cookie': pinterestCookies
};

module.exports = {
  pinterestHeaders
};