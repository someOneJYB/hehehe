class Counter {
    state = {
        count: 1,
    },
    increment() {
        const { count } = this.state;
        this.setState({ count: count + 1 });
    }
    decrement() {
        const { count } = this.state;
        this.setState({ count: count - 1 });
    }
    async incrementAsync() {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        this.increment();
    }
}
