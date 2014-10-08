define([
],function(){
  function vm(params){
    var that = this;
    // Data: value is either null, 'like', or 'dislike'
    this.chosenValue = params.value;
     
    // Behaviors
    this.like = function() { that.chosenValue('like'); }
    this.dislike = function() { that.chosenValue('dislike'); }
  } 
    
  return vm;    
});