const { Sequelize, Op, where } = require('sequelize');
class APIFeatures {
  constructor(model, queryString) {
    this.model = model;
    this.queryString = queryString;
  }

  filter() {
    const operatorMap = {
      gte: Op.gte,
      gt: Op.gt,
      lte: Op.lte,
      lt: Op.lt,
    };
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit'];
    excludedFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);

    const whereClause = {};
    const attributes = JSON.parse(queryStr);
    for (const key in attributes) {
      const value = attributes[key];
      if (typeof value === 'object' && value !== null) {
        const newKey = {};
        for (const op in value) {
          if (operatorMap[op]) {
            newKey[operatorMap[op]] = value[op];
          } else {
            newKey[op] = value[op];
          }
        }
        whereClause[key] = newKey;
      } else {
        whereClause[key] = value;
      }
    }

    let sortBy = {};
    if (this.queryString.sort) {
      sortBy = this.queryString.sort.split(',').map((field) => {
        if (field.startsWith('-')) {
          return [field.slice(1), 'DESC'];
        } else {
          return [field, 'ASC'];
        }
      });
    } else {
      sortBy = [['createdAt', 'ASC']];
    }

    if (this.queryString.limit) {
      const limit = parseInt(this.queryString.limit);
      this.query = this.model.findAll({
        where: whereClause,
        order: sortBy,
        limit: limit,
      });
    } else {
      this.query = this.model.findAll({
        where: whereClause,
        order: sortBy,
        separate: true,
      });
    }
    return this;
  }
}
module.exports = APIFeatures;
