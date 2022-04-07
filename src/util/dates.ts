import { format, formatISO, getDaysInMonth, isValid, parseISO } from "date-fns";


/**
 * Simple Date Container to be used allover the codebase, standardize behavior and decouple dependencies
 */
export class DateContainer {

    // Starts with 0
    public calendarYear?: number;
    // Starts with 1
    public calendarMonth?: number;
    // Starts with 1
    public calendarDate?: number;

    private _cachedDate?: Date;
    private _cachedFirstDateOfTheMonth?: Date;

    constructor(
        calendarYear: number | undefined = undefined,
        calendarMonth: number | undefined = undefined,
        calendarDay: number | undefined = undefined,
    ) {
        this.calendarYear = calendarYear;
        this.calendarMonth = calendarMonth;
        this.calendarDate = calendarDay;
    }

    // YYYY-MM-DD
    static fromISO_OnlyDate(isoDate: string | undefined | null ): DateContainer {
        if ((isoDate === undefined) || (isoDate === null)) {
            return new DateContainer();
        }
        const parseAttempt = parseISO(isoDate);
        if (isValid(parseAttempt)) {
            return DateContainer.fromDate(parseAttempt);
        }
        return new DateContainer()
    }

    static fromDate(date: Date): DateContainer {
        return new DateContainer(
            date.getFullYear(),
            date.getMonth() + 1,
            date.getDate(),
        );
    }

    // YYYY-MM-DD
    generateISO_OnlyDate(): string | null {
        if (
            this.isEmpty()
            || (!this.isValid())
        ) {
            return null;
        }
        const date = this.getDateObject();
        if (date === undefined) {
            return null;
        }
        return formatISO(date, { representation: 'date' });
    }

    isValid(): boolean {
        const date = this.getDateObject();
        if (date === undefined) {
            return false;
        }
        return isValid(date);
    }

    isEmpty(): boolean {
        return (this.calendarYear === undefined) && (this.calendarMonth === undefined) && (this.calendarDate === undefined)
    }

    getDateObject(): Date | undefined {
        if (
            this.calendarYear === undefined
            || this.calendarMonth === undefined
            || this.calendarDate === undefined
            // https://en.wikipedia.org/wiki/Year_zero differs from Javascript's implementation
            // https://gitlab.com/acdh-oeaw/oebl/oebl-irs-devops/-/issues/41
            || this.calendarYear < 1
        ) {
            return undefined;
        }

        if (
            this._cachedDate !== undefined
            && this.equalsDate(this._cachedDate)
        ) {
            return this._cachedDate;
        }

        this._cachedDate = DateContainer.createDate(this.calendarYear, this.calendarMonth, this.calendarDate);
        return this._cachedDate;
    }

    getMaxDate(): number {

        const defaultMaxDate = 31;

        // Early return 1: No way to tell
        if (
            this.calendarYear === undefined
            || this.calendarMonth === undefined
        ) {
            return defaultMaxDate;
        }

        // Check for cached date uptodate and try to create if not
        if (
            this._cachedFirstDateOfTheMonth === undefined
            || !this.equalsDate(this._cachedFirstDateOfTheMonth, true)
        ) {
            this._cachedFirstDateOfTheMonth = DateContainer.createDate(this.calendarYear, this.calendarMonth, 1);
        }

        // Early return 2: Could not create first day of month -> default
        if (this._cachedFirstDateOfTheMonth === undefined) {
            return defaultMaxDate;
        }
        return getDaysInMonth(this._cachedFirstDateOfTheMonth);
    }

    reset(): DateContainer {
        this._cachedDate = undefined;
        this.calendarYear = undefined;
        this.calendarMonth = undefined;
        this.calendarDate = undefined;
        return this;
    }

    equals(other: DateContainer): boolean {
        return this.calendarYear === other.calendarYear
            && this.calendarMonth === other.calendarMonth
            && this.calendarDate === other.calendarDate
            ;
    }

    equalsDate(date: Date, ignoreDay: boolean = false): boolean {
        return this.calendarYear === date.getFullYear()
            && this.calendarMonth === (date.getMonth() + 1)
            && (
                ignoreDay
                || this.calendarDate === date.getDate()
            )
            ;
    }

    static createDate(calendarYear: number, calendarMonth: number, calendarDate: number): Date | undefined {
        const indexMonth = calendarMonth - 1;
        const date = new Date();
        date.setDate(calendarDate); // Do this first! Else: if today > 28/29 and calenderMonth = 2 -> overflow, due to default
        date.setFullYear(calendarYear);
        date.setMonth(indexMonth);
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);


        // No overflow!
        if (date.getMonth() !== indexMonth) {
            console.debug({date, indexMonth, calendarMonth, calendarDate, calendarYear})

            return undefined;
        }

        return date;
    }

    toString(): string {
        const date = this.getDateObject();
        if (date === undefined) {
            return '';
        }
        return format(date, 'dd.LL.u');
    }

}

