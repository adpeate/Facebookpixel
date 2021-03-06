// Generated by CoffeeScript 1.10.0
(function() {
  var FacebookPixelCart, cookieAddToCart, cookieRemoveFromCart, delCookie, facebookpixelcart, getCookie, googleAnalyticsUniversalData;

  cookieAddToCart = 'facebookpixel_add';

  cookieRemoveFromCart = 'facebookpixel_remove';

  googleAnalyticsUniversalData = googleAnalyticsUniversalData || {
    'shoppingCartContent': []
  };

  getCookie = function(name) {
    var cookie, end, offset, search, setStr;
    cookie = ' ' + document.cookie;
    search = ' ' + name + '=';
    setStr = null;
    offset = 0;
    end = 0;
    if (cookie.length > 0) {
      offset = cookie.indexOf(search);
      if (offset !== -1) {
        offset += search.length;
        end = cookie.indexOf(';', offset);
        if (end === -1) {
          end = cookie.length;
        }
        setStr = unescape(cookie.substring(offset, end));
      }
    }
    return setStr;
  };

  delCookie = function(name) {
    var cookie;
    cookie = name + '=' + '; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/; domain=.' + window.location.host;
    document.cookie = cookie;
  };

  FacebookPixelCart = function() {
    this.productQtys = [];
    this.origProducts = {};
    this.productWithChanges = [];
    this.addedProducts = [];
    this.removedProducts = [];
  };

  FacebookPixelCart.prototype = {
    subscribeProductsUpdateInCart: function() {
      var context;
      context = this;
      $$('[data-cart-item-update]').each(function(element) {
        $(element).stopObserving('click').observe('click', function() {
          context.updateCartObserver();
        });
      });
      $$('[data-multiship-item-update]').each(function(element) {
        $(element).stopObserving('click').observe('click', function() {
          context.updateMulticartCartObserver();
        });
      });
      $$('[data-cart-empty]').each(function(element) {
        $(element).stopObserving('click').observe('click', function() {
          context.emptyCartObserver();
        });
      });
    },
    emptyCartObserver: function() {
      var i, product;
      this.collectOriginalProducts();
      for (i in this.origProducts) {
        if (i !== 'length' && this.origProducts.hasOwnProperty(i)) {
          product = Object.extend({}, this.origProducts[i]);
          this.removedProducts.push(product);
        }
      }
      this.cartItemRemoved();
    },
    updateMulticartCartObserver: function() {
      this.collectMultiProductsWithChanges();
      this.collectProductsForMessages();
      this.cartItemAdded();
      this.cartItemRemoved();
    },
    updateCartObserver: function() {
      this.collectProductsWithChanges();
      this.collectProductsForMessages();
      this.cartItemAdded();
      this.cartItemRemoved();
    },
    collectMultiProductsWithChanges: function() {
      var cartProduct, groupedProducts, i, j, product;
      this.collectOriginalProducts();
      this.collectMultiCartQtys();
      this.productWithChanges = [];
      groupedProducts = {};
      i = 0;
      while (i < this.productQtys.length) {
        cartProduct = this.productQtys[i];
        if (typeof groupedProducts[cartProduct.id] === 'undefined') {
          groupedProducts[cartProduct.id] = parseInt(cartProduct.qty, 10);
        } else {
          groupedProducts[cartProduct.id] += parseInt(cartProduct.qty, 10);
        }
        i++;
      }
      for (j in groupedProducts) {
        if (groupedProducts.hasOwnProperty(j)) {
          if (typeof this.origProducts[j] !== 'undefined' && groupedProducts[j] !== this.origProducts[j].qty) {
            product = Object.extend({}, this.origProducts[j]);
            product['qty'] = groupedProducts[j];
            this.productWithChanges.push(product);
          }
        }
      }
    },
    collectProductsWithChanges: function() {
      var cartProduct, i, product;
      this.collectOriginalProducts();
      this.collectCartQtys();
      this.productWithChanges = [];
      i = 0;
      while (i < this.productQtys.length) {
        cartProduct = this.productQtys[i];
        if (typeof this.origProducts[cartProduct.id] !== 'undefined' && cartProduct.qty !== this.origProducts[cartProduct.id].qty) {
          product = Object.extend({}, this.origProducts[cartProduct.id]);
          if (parseInt(cartProduct.qty, 10) > 0) {
            product['qty'] = cartProduct.qty;
            this.productWithChanges.push(product);
          }
        }
        i++;
      }
    },
    collectOriginalProducts: function() {
      if (googleAnalyticsUniversalData && googleAnalyticsUniversalData['shoppingCartContent']) {
        this.origProducts = googleAnalyticsUniversalData['shoppingCartContent'];
      }
    },
    collectMultiCartQtys: function() {
      var productQtys;
      productQtys = [];
      $$('[data-multiship-item-id]').each(function(element) {
        productQtys.push({
          'id': $(element).readAttribute('data-multiship-item-id'),
          'qty': $(element).getValue()
        });
      });
      this.productQtys = productQtys;
    },
    collectCartQtys: function() {
      var productQtys;
      productQtys = [];
      $$('[data-cart-item-id]').each(function(element) {
        productQtys.push({
          'id': $(element).readAttribute('data-cart-item-id'),
          'qty': $(element).getValue()
        });
      });
      this.productQtys = productQtys;
    },
    collectProductsForMessages: function() {
      var i, product;
      this.addedProducts = [];
      this.removedProducts = [];
      i = 0;
      while (i < this.productWithChanges.length) {
        product = this.productWithChanges[i];
        if (typeof this.origProducts[product.id] !== 'undefined') {
          if (product.qty > this.origProducts[product.id].qty) {
            product.qty = Math.abs(this.origProducts[product.id].qty - product.qty);
            this.addedProducts.push(product);
          } else if (product.qty < this.origProducts[product.id].qty && product.qty !== 0) {
            product.qty = product.qty - this.origProducts[product.id].qty;
            this.addedProducts.push(product);
          } else {
            product.qty = Math.abs(product.qty - this.origProducts[product.id].qty);
            this.removedProducts.push(product);
          }
        }
        i++;
      }
    },
    formatProductsArray: function(productsIn) {
      var i, itemId, productsOut;
      productsOut = [];
      itemId = void 0;
      for (i in productsIn) {
        if (i !== 'length' && productsIn.hasOwnProperty(i)) {
          if (typeof productsIn[i]['sku'] !== 'undefined') {
            itemId = productsIn[i].sku;
          } else {
            itemId = productsIn[i].id;
          }
          productsOut = {
            content_name: productsIn[i].name,
            content_ids: productsIn[i].id,
            content_type: 'product',
            value: productsIn[i].price,
            currency: productsIn[i].currency,
            product_catalog_id: productsIn[i].product_catalog_id
          };
        }
      }
      return productsOut;
    },
    cartItemAdded: function() {
      if (this.addedProducts.length === 0) {
        return;
      }
      if (typeof fbq !== "undefined" && fbq !== null) {
        fbq('track', 'AddToCart', this.formatProductsArray(this.addedProducts));
      }
      this.addedProducts = [];
    },
    cartItemRemoved: function() {
      if (this.removedProducts.length === 0) {
        return;
      }
      this.removedProducts = [];
    },
    parseAddToCartCookies: function() {
      var addProductsList;
      if (getCookie(cookieAddToCart)) {
        this.addedProducts = [];
        addProductsList = decodeURIComponent(getCookie(cookieAddToCart));
        this.addedProducts = JSON.parse(addProductsList);
        delCookie(cookieAddToCart);
        this.cartItemAdded();
      }
    },
    parseRemoveFromCartCookies: function() {
      var removeProductsList;
      if (getCookie(cookieRemoveFromCart)) {
        this.removedProducts = [];
        removeProductsList = decodeURIComponent(getCookie(cookieRemoveFromCart));
        this.removedProducts = JSON.parse(removeProductsList);
        delCookie(cookieRemoveFromCart);
        this.cartItemRemoved();
      }
    }
  };

  facebookpixelcart = new FacebookPixelCart;

  document.observe('dom:loaded', function() {
    facebookpixelcart.parseAddToCartCookies();
    facebookpixelcart.parseRemoveFromCartCookies();
  });

}).call(this);
