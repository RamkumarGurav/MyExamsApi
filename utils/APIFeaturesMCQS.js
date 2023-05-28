class APIFeatures {
  //this api takes query method(query) of diff models and using req.query(query.string) it adds diff query methods to query //using this class we can create 'features ' object which has query field (query of all methods)
  constructor(query, queryObject) {
    //Model.find(),req.query
    this.query = query;
    this.queryObject = queryObject;
  }

  filter() {
    //1a)Filtering
    const queryObj = { ...this.queryObject }; //shollow copy of query object
    const exludedFields = ["sort", "page", "limit", "fields", "keyword"];
    exludedFields.forEach((field) => delete queryObj[field]); //exluding certian fields from query object so that we can build chained methods for them

    //1b)Advanced filtering using gte,gt,lte,lte
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);
    const AdvancedQueryObj = JSON.parse(queryStr);

    this.query = this.query.find(AdvancedQueryObj); //adding query methods to "query" field of the class

    return this; //by returning this it makes chaining of diff methods on objects becomes possibles//because if return this object then only we can add diff query methods to it by chaing diff query methods
  }

  search() {
    //searchin mongdv: Model.find({name:{$regex:'product1',$options:'i'}})//options 'i' means searching for lower as well as  uppper case letters
    const keyword = this.queryObject.keyword
      ? { question: { $regex: this.queryObject.keyword, $options: "i" } }
      : {};
    this.query = this.query.find({ ...keyword });
    return this;
  }

  sort() {
    if (this.queryObject.sort) {
      // console.log(this.queryObject.sort); //output=>price,duration  //in order to sort using multiple values we need 'query.sort('price duration') //so we need to make that coma into space
      const sortByStr = this.queryObject.sort.split(",").join(" "); //bcz url

      // console.log(sortBy); //output=>price duration
      // query.sort(this.queryObject.sort);//to make sort in decreasing order add minus to value in url eg: http://localhost:3000/api/v1/tours?sort=-price
      this.query = this.query.sort(sortByStr);
      //we can sort by multiple values first by price then by duration eg:http://localhost:3000/api/v1/tours?sort=price,duration
      //we seacrch like this- Model.find().sort('price duration')
    } else {
      //default sorting in decreasing order of dates of creation
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }

  limitFields() {
    if (this.queryObject.fields) {
      const fieldsStr = this.queryObject.fields.split(",").join(" "); //making string of feilds with space between them///bcz we search in query like this Model.find().selet('name duration price')

      this.query = this.query.select(fieldsStr); //looks like- this.query.select('name duration price') for eg-http://localhost:3000/api/v1/tours?fields=name,duration,price//but we search in query like this Model.find().selet('name duration price')
    } else {
      //defulat condition exluding __v filed in the output//to exlude add minus to value
      this.query = this.query.select("-__v");
    }
    return this;
  }

  paginate(resultsPerPage) {
    //for eg-http://localhost:3000/api/v1/tours?page=3&limit=10 -this means we want 3rd page with 10 document - so we have skip 1st 20 document to show next 10 (20 t0 30)document -in the query we search like this-Model.find().skip(20).limit(10) to show 3rd page with 10 documents
    const page = this.queryObject.page * 1 || 1; //pages in number form with 1st page as default
    const limit = resultsPerPage * 1 || 20; //limit in number form with 20 as default
    const skip = (page - 1) * limit; //calculating skip value to skip (page-1)*limit no.of documents to display the page
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
