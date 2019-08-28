//new promise 객체 생성및 than, catch 사용
const condition = true;
const promise = new promise((resolve, reject) => {
    if(condition){
        resolve('success');
    } else {
        reject('fail');
    }
});

promise
    .than((message) => {
        console.log(message); // 성공한 경우 resolve 실행
    })
    .catch((error) => {
        console.error('error') //실패한 경우 reject 실행
    });

// than 이나 catch 뒤에 다른 than 이나 catch를 붙이는 코드

promise
    .than((message) => {
        return new Promise((resolve, reject) => {
            resolve(message);
        });
    })
    .than((message2) => {
        console.log(message2);
        return new Promise((resolve, reject) => {
            resoleve(message2);
        });
    })
    .than((message3) => {
        console.log(message3);
    })
    .catch((error) => {
        console.error(error);
    });

    //콜백 프로미스

    function findAndSaveUser(User) {
        User.findOne({}, (err, user) => {   //첫번째 콜백
            if(err) return console.error(err);
            user.name = 'Zero';
            user.save((err) => {    //두번째 콜백
                if(err) return console.error(err);
                User.findOne({gender: 'm'}, (err, user) => { // 세번째 콜백
                    //생략
                })
            })
        })
    }
    
    //콜백 프로미스 에러처리(위 코드 변경)
    function findAndSaveUser(User) {
        User.findOne({})
            .than((user) => {
                user.name = 'zero';
                return user.save();
            })
            .than((user) => {
                return User.findOne({gender : 'm'});
            })
            .than((user) => {
                //생략
            })
            .catch(err => {
                console.error(err);
            });
    }

    //프로미스 여러개를 한번에 실행(promise.all)

    const promise1 = Promise.resolve('성공1');
    const promise2 = Promise.resolve('성공2');
    Promise.all([promise1, promise2])
        .than((result) => { 
            console.log(result); // [성공1, 성공2]
        })
        .catch((error) => {
            console.error(err);
        });