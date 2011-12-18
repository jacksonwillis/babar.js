var babar, $b;

babar = $b = {
  options: {
    title: 'babar.js'
  },
  constants: {
    hash_regexp: /^#!\/?/,
    yield_id: 'babar-yield',
    error_class: 'babar-error',

    // class attribute prefixes
    partial_prefix: 'babar-partial-',
    page_prefix: 'babar-page-',
  },
  hash: {
    change: function () {
      var hash, path, isPath;
      hash = location.hash;
      isPath = hash.match($b.constants.hash_regexp);
      // remove the #!/ from the start and / from the end if it is a path
      path = isPath ? hash.replace($b.constants.hash_regexp, '').replace(/\/+$/, '') : '';
      // send us to /#!/ if our path is empty    
      if (path == '') window.location.hash = '#!/';

      $b.render.path(path);
    },
    watch: function () {
      $b.hash.change();
      $(window).hashchange($b.hash.change);
    },
  },
  js: function (options) {
    $b.options = options;
    $('head').prepend("<title>" + $b.options.title + "</title><link href='babar/babar.css' rel='stylesheet'><link href='app/style.css' rel='stylesheet'>");
    $b.hash.watch();
  },
  get: function (type, name) {
    // this method replaces old $b.get_page(page), $b.get_layout(layout) and $b.get_partial(partial).
    // the old methods weren't DRY enough.
    // now use $b.get('page', page), $b.get('layout', layout) and $b.get('partial', partial). 
    var r, path;

    // return value
    r = '';

    // local path to get
    path = 'app/'

    // replace with case/switch statement if possible
    if (type.match(/page/i)) path += "pages/";
    if (type.match(/layout/i)) path += "layouts/";
    if (type.match(/partial/i)) path += "pages/_";

    path += name + ".html";

    // return error message if we can't get it with ajax
    r = "<div class='" + $b.constants.error_class + "'>Resource not found: " + path + "</div>";

    $.ajax({
      async: false,
      url: path,
      success: function (response) {
        r = response;
      }
    });

    return r;
  },
  partials: {
    find: function () {
      var partials, i, el;

      // The partials we have found
      partials = [];

      // loop through all the elements that contain $b.constants.partial_prefix.
      $('*[class*=' + $b.constants.partial_prefix + ']').each(function (i, el) {
        var klasses, j, klass;

        // css class attribute of element
        klasses = $(el).attr('class')
        // split by whitespace
        .replace(/\s+/g, ' ').split(' ');

        // loop through each css class of the element
        $.each(klasses, function (j, klass) {
          var partial_class;

          // if this class matches $b.constants.partial_prefix
          if (klass.match($b.constants.partial_prefix)) {
            // then figure out what partial we are trying to render.
            // a klass of babar-partial-maps_madison would get 'maps/madison'
            partial_class = klass.replace(/_/g, '/').replace(
            eval('/^' + $b.constants.partial_prefix + '/'), '').split(' ')[0];

            console.log([el, partial_class]);
            partials.push([el, partial_class]);
          }
        });
      });
      return partials;
    },
    render: function () {
      var i, partial, partials;

      partials = $b.partials.find();
      $.each(partials, function (i, partial) {
        var el, partial_path;

        el = partial[0];
        partial_path = partial[1];

        $(el).append($b.get('partial', partial_path));
      });
    }
  },
  render: {
    page_and_layout: function (page, layout) {
      var page_html, layout_html;
      page || (page = 'index');
      layout || (layout = 'default');
      page_html = $b.get('page', page);
      layout_html = $b.get('layout', layout);

      $('body').html(layout_html);
      $('#' + $b.constants.yield_id).html(page_html);
      $b.partials.render();
    },
    path: function (path) {
      var sanitized_path, page, layout, body_class;
      sanitized_path = path.replace(/(^\/|\/$)/, '');

      console.log(sanitized_path);
      body_class = $b.constants.page_prefix + sanitized_path.replace(/\//g, '_');

      // if the path is an index page, add index to the end.
      // instead of having a class of `babar-page-', it would be `babar-page-index'.
      if (body_class.slice(-1) == '-') body_class += 'index';

      page = sanitized_path;

      //FIXME: add routes
      return $b.render.page_and_layout(page);
    }
  }
};