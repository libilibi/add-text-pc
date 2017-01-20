'use strict';

$(function() {
    const RIGHT_PANEL_WIDTH = $('.right-panel').width();
    
    $('#c1').css('max-height', (window.innerHeight - 2));
    
    $('#img_file').change(function(e) {
        fileChanged(e.originalEvent);
        $('.left-panel').width(window.innerWidth - RIGHT_PANEL_WIDTH).height(window.innerHeight);
        $('#c1').css('max-height', (window.innerHeight - 2)).css('max-width', window.innerWidth - RIGHT_PANEL_WIDTH);
        $('#img_output').css('max-height', (window.innerHeight - 2)).css('max-width', window.innerWidth - RIGHT_PANEL_WIDTH);
    });
    
    $('#text-color').change(function() {
        updateCanvas();
        updateImage();
    });
    $('#text-frame-color').change(function() {
        updateCanvas();
        updateImage();
    });
    $('#text-shadow-color').change(function() {
        updateCanvas();
        updateImage();
    });
    $('#text-shadow').change(function() {
        updateCanvas();
        updateImage();
    });
    $('#font').change(function() {
        updateCanvas();
        updateImage();
    });
    $('#text').keyup(function() {
        updateCanvas();
    });
    $('#text').change(function() {
        updateImage();
    });
    $(window).resize(function() {
        $('.left-panel').width(window.innerWidth - RIGHT_PANEL_WIDTH).height(window.innerHeight);
        $('#c1').css('max-height', (window.innerHeight - 2)).css('max-width', window.innerWidth - RIGHT_PANEL_WIDTH);
        $('#img_output').css('max-height', (window.innerHeight - 2)).css('max-width', window.innerWidth - RIGHT_PANEL_WIDTH);
    });
    $('#font-size').change(function() {
        updateCanvas();
        updateImage();
    });
    $('input[name=orientation]').change(function() {
        updateCanvas();
        updateImage();
    });
    $('#layout').change(function() {
        if ($('#layout').val() == 'overlay') {
            $('#background').hide();
        } else {
            $('#background').show();
        }
        updateCanvas();
        updateImage();
    });
    if ($('#layout').val() == 'overlay') {
        $('#background').hide();
    } else {
        $('#background').show();
    }
    $('#background-color').change(function() {
        updateCanvas();
        updateImage();
    });
});

var mainImage;
var scale;

function fileChanged(e) {
    var files = e.target.files;
    if (!files[0]) {
        return;
    }
    
    var image = new Image();
    image.onload = function() {
        if (image.width < 1400 || image.height < 1400) {
            scale = 2.0;
        } else {
            scale = 1.0;
        }
        $('#c1').attr('width', image.width * scale).attr('height', image.height * scale);
        $('#c2').attr('width', image.width).attr('height', image.height);
        if ($('#font-size').val() == '') {
            $('#font-size').val(Math.floor(image.width / 26));
        }
        mainImage = image;
        updateCanvas();
        updateImage();
    };
    image.src = URL.createObjectURL(files[0]);
}

function updateCanvas() {
    if (!mainImage) {
        return;
    }
    $('#c1').show();
    $('#img_output').hide();
    
    // レイアウト計算
    let outImgWidth;
    let outImgHeight;
    let picX;
    let picY;
    let textX;
    let textY;
    if ($('#layout').val() == 'overlay') {
        outImgWidth = mainImage.width;
        outImgHeight = mainImage.height;
        picX = 0;
        picY = 0;
        textX = 0;
        textY = 0;
    } else if($('#layout').val() == 'left') {
        outImgWidth = mainImage.width * 2;
        outImgHeight = mainImage.height;
        picX = mainImage.width * scale;
        picY = 0;
        textX = 0;
        textY = 0;
    } else if($('#layout').val() == 'right') {
        outImgWidth = mainImage.width * 2;
        outImgHeight = mainImage.height;
        picX = 0;
        picY = 0;
        textX = mainImage.width * scale;
        textY = 0;
    } else if($('#layout').val() == 'bottom') {
        outImgWidth = mainImage.width;
        outImgHeight = mainImage.height * 2;
        picX = 0;
        picY = 0;
        textX = 0;
        textY = mainImage.height * scale;
    }
    let canvasWidth = outImgWidth * scale;
    let canvasHeight = outImgHeight * scale;
    $('#c1').attr('width', canvasWidth);
    $('#c1').attr('height', canvasHeight);
    if (outImgWidth < window.innerWidth - 320 && outImgHeight < window.innerHeight) {
        $('#c1').width(outImgWidth).height(outImgHeight);
    } else {
        $('#c1').width('auto').height('auto');
    }
    
    // 画像を描画
    var ctx = $('#c1')[0].getContext('2d');
    ctx.fillStyle = $('#background-color').val();
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(mainImage, picX, picY, mainImage.width * scale, mainImage.height * scale);
    
    // テキストサイズなどを取得・設定
    var fontSize = Math.floor($('#font-size').val() * scale);
    ctx.textBaseline = 'top';
    ctx.font = fontSize + 'px ' + $('#font').val();
    ctx.fillStyle = $('#text-color').val();
    ctx.strokeStyle = $('#text-frame-color').val();
    ctx.lineWidth = Math.floor(fontSize / 5);
    ctx.miterLimit = 2;
    var shadowOffset = Math.floor(fontSize / 6);
    textX += Math.floor(fontSize / 2);
    textY += Math.floor(fontSize / 2);
    if ($('input[name=orientation]:checked').val() == 'portrait') {
//        textX = Math.floor(mainImage.width * scale - fontSize * 1.5);
        if ($('#layout').val() == 'overlay' || $('#layout').val() == 'bottom') {
            textX = Math.floor(mainImage.width * scale - fontSize * 1.5);
        } else if($('#layout').val() == 'right') {
            textX = Math.floor(mainImage.width * scale * 2 - fontSize * 1.5);
        }
    }
    
    var lines = $('#text').val().split('\n');
    var lineHeight = fontSize * 1.2;
    var shadowColor = $('#text-shadow-color').val();
    var shadowFlag = $('#text-shadow:checked').val();
    
    // テキストを描画
    for (var i = 0; i < lines.length; i++) {
        if ($('#text-frame:checked').val()) {
            if (shadowFlag) {
                ctx.shadowBlur = 40;
                ctx.shadowColor = shadowColor;
                ctx.shadowOffsetX = shadowOffset / 2;
                ctx.shadowOffsetY = shadowOffset / 2;
            }
            
            if ($('input[name=orientation]:checked').val() == 'portrait') {
                strokeTextPortrait(ctx, lines[i], fontSize, -fontSize * i * 1.5 + textX, textY);
                ctx.shadowBlur = 0;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
                fillTextPortrait(ctx, lines[i], fontSize, -fontSize * i * 1.5 + textX, textY);
            } else {
                ctx.strokeText(lines[i], textX, fontSize * i * 1.5 + textY);
                ctx.shadowBlur = 0;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
                ctx.fillText(lines[i], textX, fontSize * i * 1.5 + textY);
            }
        } else {
            if (shadowFlag) {
                ctx.shadowBlur = 20;
                ctx.shadowColor = shadowColor;
                ctx.shadowOffsetX = shadowOffset;
                ctx.shadowOffsetY = shadowOffset;
            }
            ctx.fillText(lines[i], textX, lineHeight * i + textY);
        }
    }
}

function updateImage() {
    $('#c1').hide();
    $('#img_output').show();
    var img = new Image();
    img.src = $('#c1')[0].toDataURL('image/png');
    $('#c2').attr('width', $('#c1').attr('width') / scale).attr('height', $('#c1').attr('height') / scale);
    img.onload = function() {
        var ctx2 = $('#c2')[0].getContext('2d');
        ctx2.drawImage(img, 0, 0, img.width / scale, img.height / scale);
        $('#img_output').css('max-height', (window.innerHeight - 2));
        $('#img_output').attr('src', $('#c2')[0].toDataURL('image/jpeg'));
    };
}

function strokeTextPortrait(context, text, fontHeight, x, y) {
    var varticalMargin = 1.0;
    for (var i = 0; i < text.length; i++) {
        var c = text.charAt(i);
        var w = context.measureText(c);
        if ('「」ー（）()'.indexOf(c) >= 0) {
            context.translate(x + fontHeight / 2, y + fontHeight * varticalMargin * i + fontHeight * varticalMargin / 2);
            context.rotate(Math.PI / 2);
            context.strokeText(c, -fontHeight / 2, -fontHeight * varticalMargin / 2);
            context.rotate(-Math.PI / 2);
            context.translate(-(x + fontHeight / 2), -(y + fontHeight * varticalMargin * i + fontHeight * varticalMargin / 2));
        } else if ('、。'.indexOf(c) >= 0) {
            context.strokeText(c, x + fontHeight * varticalMargin / 2, y + fontHeight * i * varticalMargin - fontHeight * varticalMargin / 2);
        } else {
            context.strokeText(c, x + (fontHeight - w.width) / 2, y + fontHeight * i * varticalMargin);
        }
    }
}

function fillTextPortrait(context, text, fontHeight, x, y) {
    var varticalMargin = 1.0;
    for (var i = 0; i < text.length; i++) {
        var c = text.charAt(i);
        var w = context.measureText(c);
        if ('「」ー（）()'.indexOf(c) >= 0) {
            context.translate(x + fontHeight / 2, y + fontHeight * varticalMargin * i + fontHeight * varticalMargin / 2);
            context.rotate(Math.PI / 2);
            context.fillText(c, -fontHeight / 2, -fontHeight * varticalMargin / 2);
            context.rotate(-Math.PI / 2);
            context.translate(-(x + fontHeight / 2), -(y + fontHeight * varticalMargin * i + fontHeight * varticalMargin / 2));
        } else if ('、。'.indexOf(c) >= 0) {
            context.fillText(c, x + fontHeight * varticalMargin / 2, y + fontHeight * i * varticalMargin - fontHeight * varticalMargin / 2);
        } else {
            context.fillText(c, x + (fontHeight - w.width) / 2, y + fontHeight * i * varticalMargin);
        }
    }
}
