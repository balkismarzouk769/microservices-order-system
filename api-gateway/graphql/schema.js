const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLList,
    GraphQLSchema
} = require("graphql");



// USER TYPE
const UserType = new GraphQLObjectType({

    name: "User",

    fields: () => ({

        id: { type: GraphQLInt },

        name: { type: GraphQLString },

        email: { type: GraphQLString }
    })
});



// PRODUCT TYPE
const ProductType = new GraphQLObjectType({

    name: "Product",

    fields: () => ({

        id: { type: GraphQLInt },

        name: { type: GraphQLString },

        price: { type: GraphQLInt },

        stock: { type: GraphQLInt }
    })
});



module.exports = {
    UserType,
    ProductType
};