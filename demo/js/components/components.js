/**
 * Regsiter components that can be used in your views
 * See
 *  http://knockoutjs.com/documentation/component-overview.html
 *   For more information on declaring components
 * 
 */
define([
  'knockout'
],function(ko){
  ko.components.register('like-widget',{
    viewModel: {require: 'components/like-widget/like-widget'},
    template: {require: 'text!components/like-widget/_like-widget.html'}
  });
});