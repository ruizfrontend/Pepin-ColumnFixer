'use strict';

window.rclmng_globals = window.rclmng_globals || {};

rclmng_globals.ux.pepinColFixer = {
  $tables: [],

  init: function(e) {
    rclmng_globals.ux.pepinColFixer.$tables = $('.fixedCol-pepin'); // reset $tables
    if(rclmng_globals.ux.pepinColFixer.$tables.length == 0) return;

    rclmng_globals.ux.pepinColFixer.$tables.each(rclmng_globals.ux.pepinColFixer.initTables)
  },

  initTables: function() {
    var $table = $(this);

    var fixedRows = $table.data('fixedRows') || 1; // por el momento solo adminitos 1 columna o fila fijada, pero opcional
    var fixedCols = $table.data('fixedCols') || 1;

    if(!(fixedRows || fixedCols)) return; // both rows & cals 0 or false
    if(!$table.find('thead').length || !$table.find('tbody').length) {
      console.error('Make sure your FixedRows tables have a correct thead and tbody, please!');
      return;
    }

    $table.data('fixedRows', fixedRows);
    $table.data('fixedCols', fixedCols);

      // wrapper for all the tables
    var $wrap = $table.wrap('<div class="fixedCol-pepin-wrap"></div>').parent()
      .append('<div class="barX bar"><div class="barWrap"><div class="barInn"></div></div></div>')
      .append('<div class="barXBottom bar"><div class="barWrap"><div class="barInn"></div></div></div>')
      .append('<div class="barY bar"><div class="barWrap"><div class="barInn"></div></div></div>');

    $wrap.find('.barWrap')
      .mousedown(function(){
        $(this).addClass('mouseDown')
      })
      .mouseup(function(){
        $(this).removeClass('mouseDown')
      })
      .mousemove(rclmng_globals.ux.pepinColFixer.clickBarEvt)
      .click(rclmng_globals.ux.pepinColFixer.clickBarEvt);

        // real scroll element
    $table.wrap('<div class="fixedCol-pepin-scroller"></dov>').parent()
      .on('scroll', rclmng_globals.ux.pepinColFixer.scrollEvt);

    if(fixedRows)
      $wrap.prepend('<div class="fixedCol-pepin-fixHead">')
        .find('.fixedCol-pepin-fixHead').append($table.clone());

    if(fixedCols)
      $wrap.prepend('<div class="fixedCol-pepin-fixCol"><div class="fixedCol-pepin-fixCol-inn">')
        .find('.fixedCol-pepin-fixCol-inn').append($table.clone());
    
    rclmng_globals.ux.pepinColFixer.resizeTable($wrap);
    $wrap.find('.fixedCol-pepin-scroller').scroll()
  },
  
  resizeTables: function($wrap) {
    if(rclmng_globals.ux.pepinColFixer.$tables.length) 
      rclmng_globals.ux.pepinColFixer.$tables.each(function() {
        rclmng_globals.ux.pepinColFixer.resizeTable($(this).parents('.fixedCol-pepin-wrap'))
      })
  },

  resizeTable: function($wrap) {

    var uxElmsHeight = 265; // espacio ocupado por barras y navegaciones en paneles

    var $table = $wrap.find('.fixedCol-pepin-scroller table');

    var $scroller = $wrap.find('.fixedCol-pepin-scroller');
    var $tableLeft = $wrap.find('.fixedCol-pepin-fixCol');
    var $tableCol = $wrap.find('.fixedCol-pepin-fixHead');
    var $barX = $wrap.find('.barX');
    var $barXBottom = $wrap.find('.barXBottom');
    var $barY = $wrap.find('.barY');

      // are there overflows?
    var overFlowX = $table.width() > $wrap.width();
    var overFlowY = $table.height() > $wrap.height();

      // calculate sizes
    var tableWidth = $table.outerWidth();
    var tableHeight = $(window).height() - uxElmsHeight;

    var headHeight = $table.find('thead').height();
    var fixedColWidth = $table.find('tbody td:eq(0)').outerWidth();

    $scroller.css('height', tableHeight);
    
    $tableCol.css('height', headHeight);
    $tableLeft.show().css('width', fixedColWidth);
    $barY.css('padding-top', headHeight);
    $barX.css({
      'padding-left': fixedColWidth,
      'top': headHeight
    });
    $barXBottom.css('padding-left', fixedColWidth);
    $tableLeft.find('.fixedCol-pepin-fixCol-inn').css('width', tableWidth);

    if(overFlowX) {
      $wrap.addClass('overFX');
      $scroller.css('margin-bottom',  -1 * ($scroller[0].offsetHeight - $scroller[0].clientHeight));

    } else {
      $wrap.removeClass('overFX');
      $scroller.css('margin-bottom', 0);
    }

    if(overFlowY) {
      $wrap.addClass('overFY');
      $scroller.css('margin-right', -1 * ($scroller[0].offsetWidth - $scroller[0].clientWidth));

    } else {
      $wrap.removeClass('overFY');
      $scroller.css('margin-right', 0);
    }

  },

  clickBarEvt: function(e){
    var $bar = $(this);

    if(e.type == 'mousemove' && !$bar.hasClass('mouseDown')) return;
    
    var $wrap = $(this).parents('.fixedCol-pepin-wrap');
    var $scrollr = $wrap.find('.fixedCol-pepin-scroller');
    var $table = $wrap.find('.fixedCol-pepin-scroller table');
    
    if($bar.parent().hasClass('barX')) {
      var scrollX = (e.pageX - $bar.offset().left) / $bar.width();
      $scrollr.scrollLeft(scrollX * ($table.width() - $wrap.width()));
    } else {
      var scrollY = (e.pageY - $bar.offset().top) / $bar.height();
      $scrollr.scrollTop(scrollY * ($table.height() - $wrap.height()));
    }

    return false;
  },

  scrollEvt: function() { // event to sync scrolls
    var $wrap = $(this).parents('.fixedCol-pepin-wrap');
    var $table = $wrap.find('.fixedCol-pepin-scroller table');
    var $scroller = $wrap.find('.fixedCol-pepin-scroller');
    
    $wrap.find('.fixedCol-pepin-fixCol').scrollTop($scroller.scrollTop())
    $wrap.find('.fixedCol-pepin-fixHead').scrollLeft($scroller.scrollLeft())

    var uxElmsHeight = 265; // espacio ocupado por barras y navegaciones en paneles

    var $barX = $wrap.find('.barX, .barXBottom');
    var $barY = $wrap.find('.barY');

    var barYMaxH = $(window).height() - uxElmsHeight - $table.find('thead').height();
    var barYH = barYMaxH * $wrap.height() / $table.height();
    
    $barY.find('.barInn').css({
      height: barYH,
      top: (barYMaxH - barYH) * ($scroller.scrollTop() / ($table.height() - $wrap.height()))
    })

    var barXMaxW = $wrap.width() - $table.find('tbody td:eq(0)').outerWidth();
    var barXW = barXMaxW * $wrap.width() / $table.width();
    
    $barX.find('.barInn').css({
      width: barXW,
      left: (barXMaxW - barXW) * ($scroller.scrollLeft() / ($table.width() - $wrap.width()))
    })
  }
}