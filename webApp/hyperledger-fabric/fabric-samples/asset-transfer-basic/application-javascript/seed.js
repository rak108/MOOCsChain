const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/moocschain", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then((_) => {
    const Course = require("./models/courses");

    Course.create({ 
        id: 1,
        name: "Introduction to Machine Learning",
        courseType: "CS",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed sit amet congue ex, id euismod orci. Nunc euismod elementum tristique. Maecenas placerat mauris tortor, vehicula posuere diam aliquam non. Nam sollicitudin neque nunc, eget imperdiet libero pulvinar eget. Donec vel orci condimentum, ultrices augue at, fringilla lacus. Maecenas egestas ultricies consectetur. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.",
        checkpoints: 3,
        content: new Map(
            [
                ['Checkpoint 1', 'https://www.youtube.com/channel/UCcabW7890RKJzL968QWEykA'],
                ['Checkpoint 2', 'https://www.youtube.com/channel/UCcabW7890RKJzL968QWEykA'],
                ['Checkpoint 3', 'https://www.youtube.com/channel/UCcabW7890RKJzL968QWEykA']
            ]
        ) 
    });

    Course.create({ 
        id: 2,
        name: "Introduction to Networks",
        courseType: "CS",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed sit amet congue ex, id euismod orci. Nunc euismod elementum tristique. Maecenas placerat mauris tortor, vehicula posuere diam aliquam non. Nam sollicitudin neque nunc, eget imperdiet libero pulvinar eget. Donec vel orci condimentum, ultrices augue at, fringilla lacus. Maecenas egestas ultricies consectetur. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.",
        checkpoints: 3,
        content: new Map(
            [
                ['Checkpoint 1', 'https://www.youtube.com/channel/UCcabW7890RKJzL968QWEykA'],
                ['Checkpoint 2', 'https://www.youtube.com/channel/UCcabW7890RKJzL968QWEykA'],
                ['Checkpoint 3', 'https://www.youtube.com/channel/UCcabW7890RKJzL968QWEykA']
            ]
        ) 
    });

    Course.create({ 
        id: 3,
        name: "Introduction to Semiconductors",
        courseType: "EC",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed sit amet congue ex, id euismod orci. Nunc euismod elementum tristique. Maecenas placerat mauris tortor, vehicula posuere diam aliquam non. Nam sollicitudin neque nunc, eget imperdiet libero pulvinar eget. Donec vel orci condimentum, ultrices augue at, fringilla lacus. Maecenas egestas ultricies consectetur. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.",
        checkpoints: 3,
        content: new Map(
            [
                ['Checkpoint 1', 'https://www.youtube.com/channel/UCcabW7890RKJzL968QWEykA'],
                ['Checkpoint 2', 'https://www.youtube.com/channel/UCcabW7890RKJzL968QWEykA'],
                ['Checkpoint 3', 'https://www.youtube.com/channel/UCcabW7890RKJzL968QWEykA']
            ]
        ) 
    });

    Course.create({ 
        id: 4,
        name: "Introduction to Power Electronics",
        courseType: "EC",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed sit amet congue ex, id euismod orci. Nunc euismod elementum tristique. Maecenas placerat mauris tortor, vehicula posuere diam aliquam non. Nam sollicitudin neque nunc, eget imperdiet libero pulvinar eget. Donec vel orci condimentum, ultrices augue at, fringilla lacus. Maecenas egestas ultricies consectetur. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.",
        checkpoints: 3,
        content: new Map(
            [
                ['Checkpoint 1', 'https://www.youtube.com/channel/UCcabW7890RKJzL968QWEykA'],
                ['Checkpoint 2', 'https://www.youtube.com/channel/UCcabW7890RKJzL968QWEykA'],
                ['Checkpoint 3', 'https://www.youtube.com/channel/UCcabW7890RKJzL968QWEykA']
            ]
        ) 
    });

    Course.create({ 
        id: 5,
        name: "Introduction to Blockchains",
        courseType: "CS",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed sit amet congue ex, id euismod orci. Nunc euismod elementum tristique. Maecenas placerat mauris tortor, vehicula posuere diam aliquam non. Nam sollicitudin neque nunc, eget imperdiet libero pulvinar eget. Donec vel orci condimentum, ultrices augue at, fringilla lacus. Maecenas egestas ultricies consectetur. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.",
        checkpoints: 3,
        content: new Map(
            [
                ['Checkpoint 1', 'https://www.youtube.com/channel/UCcabW7890RKJzL968QWEykA'],
                ['Checkpoint 2', 'https://www.youtube.com/channel/UCcabW7890RKJzL968QWEykA'],
                ['Checkpoint 3', 'https://www.youtube.com/channel/UCcabW7890RKJzL968QWEykA']
            ]
        ) 
    });

    Course.create({ 
        id: 6,
        name: "Introduction to Machines",
        courseType: "Core",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed sit amet congue ex, id euismod orci. Nunc euismod elementum tristique. Maecenas placerat mauris tortor, vehicula posuere diam aliquam non. Nam sollicitudin neque nunc, eget imperdiet libero pulvinar eget. Donec vel orci condimentum, ultrices augue at, fringilla lacus. Maecenas egestas ultricies consectetur. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.",
        checkpoints: 3,
        content: new Map(
            [
                ['Checkpoint 1', 'https://www.youtube.com/channel/UCcabW7890RKJzL968QWEykA'],
                ['Checkpoint 2', 'https://www.youtube.com/channel/UCcabW7890RKJzL968QWEykA'],
                ['Checkpoint 3', 'https://www.youtube.com/channel/UCcabW7890RKJzL968QWEykA']
            ]
        ) 
    });
});
