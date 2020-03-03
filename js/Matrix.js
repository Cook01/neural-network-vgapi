class Matrix {
    constructor(rows, columns) {
        this.rows = rows;
        this.columns = columns;
        this.matrix = [];
        for (let i = 0; i < this.rows; i++) {
            this.matrix[i] = [];
            for (let j = 0; j < this.columns; j++) {
                this.matrix[i][j] = 0;
            }
        }
    }

    randomize(){
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                this.matrix[i][j] = Math.random() * 2 - 1;
            }
        }
    }

    static multiply(A, B) {
        let result = new Matrix(A.rows, A.columns);

        for (let i = 0; i < result.rows; i++) {
            for (let j = 0; j < result.columns; j++) {

                if(B instanceof Matrix)
                    result.matrix[i][j] = A.matrix[i][j] * B.matrix[i][j];
                else
                    result.matrix[i][j] = A.matrix[i][j] * B;
            }
        }

        return result;
    }

    static add(A, B) {
        let result = new Matrix(A.rows, A.columns);

        for (let i = 0; i < result.rows; i++) {
            for (let j = 0; j < result.columns; j++) {

                if(B instanceof Matrix)
                    result.matrix[i][j] = A.matrix[i][j] + B.matrix[i][j];
                else
                    result.matrix[i][j] = A.matrix[i][j] + B;
            }
        }

        return result;
    }

    static substract(A, B) {
        let result = new Matrix(A.rows, A.columns);

        for (let i = 0; i < result.rows; i++) {
            for (let j = 0; j < result.columns; j++) {

                if(B instanceof Matrix)
                    result.matrix[i][j] = A.matrix[i][j] - B.matrix[i][j];
                else
                    result.matrix[i][j] = A.matrix[i][j] - B;
            }
        }

        return result;
    }

    static dot(A, B){
        if(A.columns === B.rows){
            let result = new Matrix(A.rows, B.columns)
            for (let i = 0; i < result.rows; i++) {
                for (let j = 0; j < result.columns; j++) {
                    for(let k = 0; k < A.columns; k++){
                        result.matrix[i][j] += A.matrix[i][k] * B.matrix[k][j];
                    }
                }
            }
            return result;
        } else {
            return undefined;
        }
    }

    static transpose(A){
        let result = new Matrix(A.columns, A.rows);

        for (let i = 0; i < result.rows; i++) {
            for (let j = 0; j < result.columns; j++) {
                result.matrix[i][j] = A.matrix[j][i]
            }
        }

        return result;
    }

    static fromArray(arr){
        let result = new Matrix(arr.length, 1);

        for (let i = 0; i < result.rows; i++) {
            result.matrix[i][0] = arr[i]
        }

        return result;
    }

    static toArray(A){
        let result = []

        for (let i = 0; i < A.rows; i++) {
            for (let j = 0; j < A.columns; j++) {
                result.push(A.matrix[i][j]);
            }
        }

        return result;
    }

    map(callBack) {
        let result = new Matrix(this.rows, this.columns);

        for (let i = 0; i < result.rows; i++) {
            for (let j = 0; j < result.columns; j++) {
                result.matrix[i][j] = callBack(this.matrix[i][j]);
            }
        }

        return result;
    }

    print(){
        console.table(this.matrix);
    }
}