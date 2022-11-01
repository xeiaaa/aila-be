const mongoose = require('mongoose');
const { toJSON } = require('../../../../src/models/plugins');

describe('toJSON plugin', () => {
  let connection;

  beforeEach(() => {
    connection = mongoose.createConnection();
  });

  it('should replace _id to _id.toString()', () => {
    const schema = mongoose.Schema();
    schema.plugin(toJSON);
    const Model = connection.model('Model', schema);
    const doc = new Model();
    expect(doc.toJSON()).toHaveProperty('_id', doc._id.toString());
  });

  it('should remove __v', () => {
    const schema = mongoose.Schema();
    schema.plugin(toJSON);
    const Model = connection.model('Model', schema);
    const doc = new Model();
    expect(doc.toJSON()).not.toHaveProperty('__v');
  });

  it('should remove any path set as private', () => {
    const schema = mongoose.Schema({
      public: { type: String },
      private: { type: String, private: true },
    });
    schema.plugin(toJSON);
    const Model = connection.model('Model', schema);
    const doc = new Model({ public: 'some public value', private: 'some private value' });
    expect(doc.toJSON()).not.toHaveProperty('private');
    expect(doc.toJSON()).toHaveProperty('public');
  });

  it('should remove any nested paths set as private', () => {
    const schema = mongoose.Schema({
      public: { type: String },
      nested: {
        private: { type: String, private: true },
      },
    });
    schema.plugin(toJSON);
    const Model = connection.model('Model', schema);
    const doc = new Model({
      public: 'some public value',
      nested: {
        private: 'some nested private value',
      },
    });
    expect(doc.toJSON()).not.toHaveProperty('nested.private');
    expect(doc.toJSON()).toHaveProperty('public');
  });

  it('should also call the schema toJSON transform function', () => {
    const schema = mongoose.Schema(
      {
        public: { type: String },
        private: { type: String },
      },
      {
        toJSON: {
          transform: (doc, ret) => {
            // eslint-disable-next-line no-param-reassign
            delete ret.private;
          },
        },
      }
    );
    schema.plugin(toJSON);
    const Model = connection.model('Model', schema);
    const doc = new Model({ public: 'some public value', private: 'some private value' });
    expect(doc.toJSON()).not.toHaveProperty('private');
    expect(doc.toJSON()).toHaveProperty('public');
  });
});
