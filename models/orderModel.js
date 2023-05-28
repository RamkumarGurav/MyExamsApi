const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    shippingInfo: {
      name: {
        type: String,
        // required: true,
      },
      address: {
        type: String,
        // required: true,
      },
      country: {
        type: String,
        // required: true,
      },
      state: {
        type: String,
        // required: true,
      },
      city: {
        type: String,
        // required: true,
      },
      phoneNo: {
        type: Number,
        // required: true,
      },
      pinCode: {
        type: Number,
        // required: true,
      },
    },
    orderedItems: [
      {
        name: {
          type: String,
          // required: true,
        },
        product: {
          //product reference(ID)
          type: mongoose.Schema.ObjectId,
          ref: "Product",
          // required: true,
        },
        price: {
          type: Number,
          // required: true,
        },
        quantity: {
          type: Number,
          // required: true,
        },
        image: {
          type: String,
          // required: true,
        },
      },
    ],
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      // required: true,
    },
    paymentInfo: {
      sessionId: {
        type: String,
        // required: true,
      },
      status: {
        type: String,
        // required: true,
      },
    },
    paidAt: {
      type: Date,
      // required: true,
    },
    // itemsPrice: {
    //   type: Number,
    //   default: 0,
    // },
    // taxPrice: {
    //   type: Number,
    //   default: 0,
    // },
    // shippingPrice: {
    //   type: Number,
    //   default: 0,
    // },
    totalPrice: {
      type: Number,
      default: 0,
    },
    orderStatus: {
      type: String,
      // default: "processing",
    },
    deliveredAt: Date,
    cancelledAt: Date,
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

orderSchema.pre(/^find/, function (next) {
  this.populate("user").populate({
    path: "orderedItems.product",
    select: "name images",
  });
  next();
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
