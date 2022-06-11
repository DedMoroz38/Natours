class APIFeatures{
    constructor(query, queryString){
        this.query = query; // Tour.find()
        this.queryString = queryString; // req.query
    }
    filter(){
        const queryObj = {...this.queryString};
        const excludeFields =  ['page', 'sort', 'limit', 'fields'];
        excludeFields.forEach(el => delete queryObj[el]);

        // 1)a Advanced filtering
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
        // { difficulty: 'easy', duration: { $gte: 5}}
        // { duration: { gte: '5' }, difficulty: 'easy' }
        this.query = this.query.find(JSON.parse(queryStr));
    
        // let query = Tour.find(JSON.parse(queryStr));
        return this;
    }
    sort(){
        if(this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort('-createdAt');
        }
        return this;
    }
    limit() {
        if(this.queryString.fields){
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select('-__v');
        }
        return this;
    }
    pagination() {
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 100;
        const skip = limit * (page - 1);

        this.query = this.query.skip(skip).limit(limit);

        return this;
    }
}
module.exports = APIFeatures;