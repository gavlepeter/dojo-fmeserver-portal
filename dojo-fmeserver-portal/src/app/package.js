var profile = (function () {

	return {
		resourceTags : {
			copyOnly : function (filename, mid) {
				return copyOnly(filename, mid);
			},

			amd : function (filename, mid) {
				return !copyOnly(filename, mid) && /\.js$/.test(filename);
			}
		}
	};

})();
