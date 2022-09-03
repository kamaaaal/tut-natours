const req = require('express/lib/request');

// implementing a class which will make query functionlities gerenralized
class apiFeatures {
    // constructor
    // gets a query object and query string
    //        _tours.find()    req.query
    constructor(query, queryStr) {
        this.query = query;
        this.queryStr = queryStr;
    }

    // util function to check for an empty object
    isEmptyObject(obj) {
        return Object.keys(obj).length === 0;
    }

    //now we can implement the other functionlities(find,limit,filter,sort,page) as methods
    find() {
        // find method calls .find on query object and assigns it to its own query property
        if (!this.isEmptyObject(this.queryStr)) {
            // create a copy query string object so that we dont match special query operation to be found on the finding doc
            let query = { ...this.queryStr }; // creating a copy so that we dont delete the original query object special properties
            // like page,limit and sort
            const excludeCriterias = ['page', 'limit', 'sort', 'fields']; // these fields will be removed on local query object
            // so that we wont be finding docs with these properties
            excludeCriterias.forEach((prop) => delete query[prop]); //traversing excludeCriterias and deleting its properties in local query object
            // converting the gt an lt other string to mongo compatible $lt and $gt operator
            let queryString = JSON.stringify(query); // creating a sting so we can make operators compatible
            queryString = queryString.replace(
                /\b(gt|lt|gte|lte)\b/g,
                (match) => `$${match}`
                
            );
            query = JSON.parse(queryString);
            this.query = this.query.find(query); // passing match criterias to find method
            // we will assign it back to the this.query to save the changes
            // and return 'this' , so that we can chain other methods too
        }
        return this;
    }
    fields() {
        // filter instructs which are the properites to be projected
        if (this.queryStr?.fields) {
            // model.fields(), accepts a string with spaces specifiying the fields to be returned
            // spliting the this.queryStr.fields because the user will enter a string with commas eg(?fields=name,ratingsAverage)
            // we will have to pass it as a single spaced string like this eg: (.fields('name ratingsAverage price'))
            const fields = this.queryStr.fields.split(',').join(' ');
            this.query = this.query.select(fields); // assigning back to this.query
        }
        return this; // to chain methods
    }
    sort() {
        if (this.queryStr?.sort) {
            // model.sort also accepts a string which is spaced by fields
            const sort = this.queryStr.sort.split(',').join(' ');
            console.log('sortString', sort);
            this.query = this.query.sort(sort);
        }
        // return this
        return this;
    }
    paginate() {
        if (this.queryStr?.page) {
            const page = this.queryStr.page || 1;
            const limit = this.queryStr.limit || 100;
            // create skip count
            const skip = (page - 1) * limit - 1;
            // asign back
            // skip methods skips all the documents till its index
            // .limit() limits the no. of documents
            this.query = this.query.skip(skip).limit();
        }
        return this;
    }
}
module.exports = apiFeatures;
