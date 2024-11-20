


const sanitize = (value) => {

  var regexpSamp = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;'
  };
  return value.replace( /[&<>'"]/gi, (match)=>(regexpSamp[match]) )
  
}

export default sanitize